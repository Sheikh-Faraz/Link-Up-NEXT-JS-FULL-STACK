
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import Message from "@/models/Message";
import User from "@/models/User";
import ForwardHistory from "@/models/ForwardHistory";

import { getCurrentUser } from "@/lib/getCurrentUser";
import { pusher } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    const currentUserId = String(currentUser._id);

    const body = await req.json();
    const { messageId, receiverIds } = body;

    // Validate the selected message
    if (
      !messageId ||
      !mongoose.Types.ObjectId.isValid(messageId)
    ) {
      return NextResponse.json(
        { message: "A valid message ID is required." },
        { status: 400 }
      );
    }

    // We now accept multiple recipients
    if (!Array.isArray(receiverIds) || receiverIds.length === 0) {
      return NextResponse.json(
        { message: "Select at least one recipient." },
        { status: 400 }
      );
    }

    if (receiverIds.length > 50) {
      return NextResponse.json(
        { message: "You can forward to up to 50 recipients at once." },
        { status: 400 }
      );
    }

    const uniqueReceiverIds = [...new Set(
      receiverIds.map((id: unknown) => String(id))
    )];

    if (
      uniqueReceiverIds.some(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      )
    ) {
      return NextResponse.json(
        { message: "One or more recipient IDs are invalid." },
        { status: 400 }
      );
    }

    if (uniqueReceiverIds.includes(currentUserId)) {
      return NextResponse.json(
        { message: "You cannot forward a message to yourself." },
        { status: 400 }
      );
    }

    // Find a message the current user is allowed to view.
    const sourceMessage = await Message.findOne({
      _id: messageId,
      isDeletedFor: { $ne: currentUser._id },
    });

    if (
      !sourceMessage ||
      sourceMessage.text === "🛇 This message was deleted"
    ) {
      return NextResponse.json(
        { message: "Message not found or no longer available." },
        { status: 404 }
      );
    }

    // Check every recipient exists and neither side has blocked the other.
    const recipients = await User.find({
      _id: { $in: uniqueReceiverIds },
    }).select("_id blockedUsers");

    if (recipients.length !== uniqueReceiverIds.length) {
      return NextResponse.json(
        { message: "One or more recipients could not be found." },
        { status: 404 }
      );
    }

    const senderBlockedUsers = (currentUser.blockedUsers || []).map(
      (id: mongoose.Types.ObjectId) => String(id)
    );

    const invalidRecipient = recipients.some((recipient) => {
      const recipientId = String(recipient._id);

      const recipientBlockedUsers = (
        recipient.blockedUsers || []
      ).map((id: mongoose.Types.ObjectId) => String(id));

      return (
        senderBlockedUsers.includes(recipientId) ||
        recipientBlockedUsers.includes(currentUserId)
      );
    });

    if (invalidRecipient) {
      return NextResponse.json(
        { message: "You cannot forward to a user involved in a block relationship.", },
        { status: 403 }
      );
    }

    // const sourceMessageId = sourceMessage._id;
    const originalSenderId =
      sourceMessage.forwardedFrom || sourceMessage.senderId;

    const originalMessageId =
      sourceMessage.forwardedFromMessageId || sourceMessage._id;

    // Copy metadata only. Do not upload the same Cloudinary files again.
    const attachments = (sourceMessage.attachments || []).map(
      (file: any) => ({
        fileName: file.fileName,
        fileUrl: file.fileUrl,
        fileType: file.fileType || "",
        filePublicId: file.filePublicId || "",
        fileResourceType: file.fileResourceType || "",
        fileSize: file.fileSize || 0,
      })
    );

    // Support messages created using the older single-file fields.
    if (
      attachments.length === 0 &&
      sourceMessage.fileUrl
    ) {
      attachments.push({
        fileName: sourceMessage.fileName || "File",
        fileUrl: sourceMessage.fileUrl,
        fileType: sourceMessage.fileType || "",
        filePublicId: sourceMessage.filePublicId || "",
        fileResourceType: sourceMessage.fileResourceType || "",
        fileSize: 0,
      });
    }

    const forwardedMessages = [];

    for (const recipient of recipients) {
      const recipientId = String(recipient._id);

      const forwardedMessage = await Message.create({
        senderId: currentUser._id,
        receiverId: recipient._id,
        text: sourceMessage.text || "",
        attachments,

        // Keep compatibility with the existing single-file fields.
        fileName: attachments[0]?.fileName || "",
        fileUrl: attachments[0]?.fileUrl || "",
        fileType: attachments[0]?.fileType || "",
        filePublicId: attachments[0]?.filePublicId || "",
        fileResourceType: attachments[0]?.fileResourceType || "",

        // Preserve the original sender across forwarding chains.
        forwardedFrom: originalSenderId,
        forwardedFromMessageId: originalMessageId,
        forwardedBy: currentUser._id,
        isForwarded: true,

        // A forwarded copy starts as a new message.
        replyTo: [],
        reactions: [],
        seenBy: [],
        isEdited: false,
        isDeletedFor: [],
      });

    //   await ForwardHistory.create({
    //     sourceMessageId,
    //     forwardedBy: currentUser._id,
    //     recipientId: recipient._id,
    //     forwardedMessageId: forwardedMessage._id,
    //   });

    await ForwardHistory.create({
        sourceMessageId: sourceMessage._id,
        forwardedBy: currentUser._id,
        recipientId: recipient._id,
        forwardedMessageId: forwardedMessage._id,
        forwardedAt: forwardedMessage.createdAt ?? new Date(),
    });

      const formattedMessage = {
        _id: forwardedMessage._id,
        senderId: forwardedMessage.senderId,
        receiverId: forwardedMessage.receiverId,
        text: forwardedMessage.text,
        createdAt: forwardedMessage.createdAt,
        updatedAt: forwardedMessage.updatedAt,
        attachments: forwardedMessage.attachments,

        fileName: forwardedMessage.fileName,
        fileUrl: forwardedMessage.fileUrl,
        fileType: forwardedMessage.fileType,
        filePublicId: forwardedMessage.filePublicId,
        fileResourceType: forwardedMessage.fileResourceType,

        forwardedFrom: forwardedMessage.forwardedFrom,
        forwardedFromMessageId:
          forwardedMessage.forwardedFromMessageId,
        forwardedBy: forwardedMessage.forwardedBy,
        isForwarded: true,

        replyTo: forwardedMessage.replyTo,
        seenBy: [],
      };

      // Notify this recipient's existing chat channel.
      const chatId =
        currentUserId < recipientId
          ? `${currentUserId}-${recipientId}`
          : `${recipientId}-${currentUserId}`;

      await pusher.trigger(
        `chat-${chatId}`,
        "new-message",
        formattedMessage
      );

      forwardedMessages.push(formattedMessage);
    }

    return NextResponse.json(
      {
        message: "Message forwarded successfully.",
        messages: forwardedMessages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Forward message error:", error);

    return NextResponse.json(
      { message: "Failed to forward message." },
      { status: 500 }
    );
  }
}
