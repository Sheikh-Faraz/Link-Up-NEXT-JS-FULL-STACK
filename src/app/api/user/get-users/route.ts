import mongoose from "mongoose";

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Contact from "@/models/Contact";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 🔹 Extract token
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔹 Verify token
    const decoded = verifyToken(token) as { userId: string };
    const currentUserId = decoded.userId;
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    // 1️⃣ Get logged-in user's deleted list
    const loggedInUser = await User.findById(currentUserId)
      .select("isDeletedFor");

    if (!loggedInUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }


    // 2️⃣ Get all contacts
    const contacts = await Contact.find({
      user: currentUserId,
    })
      .populate(
        "contact",
        "UserId fullName profilePic email about blockedUsers isDeletedFor"
      )
      .sort({ createdAt: -1 });

    // 3️⃣ Filter out deleted users
    const filteredContacts = contacts
      .map((c) => c.contact)
      .filter(
        (contact) =>
          contact &&
          !loggedInUser.isDeletedFor.includes(contact._id)
      );


    // 4️⃣ Get the latest visible message for all contacts in ONE query
    const contactIds = filteredContacts.map((contact) => contact._id);

    const latestMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: currentUserObjectId,
              receiverId: { $in: contactIds },
            },
            {
              receiverId: currentUserObjectId,
              senderId: { $in: contactIds },
            },
          ],

          // Don't show messages deleted for the current user
          isDeletedFor: {
            $ne: currentUserObjectId,
          },
        },
      },

      // Newest messages first
      {
        $sort: {
          createdAt: -1,
        },
      },

      // Get the latest message for each other user
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", currentUserObjectId] },
              "$receiverId",
              "$senderId",
            ],
          },

          lastMessage: {
            $first: {
              _id: "$_id",
              senderId: "$senderId",
              receiverId: "$receiverId",
              text: "$text",
              fileName: "$fileName",
              fileType: "$fileType",
              attachments: "$attachments",
              createdAt: "$createdAt",
              seenBy: "$seenBy",
            },
          },
        },
      },
    ]);


    // 5️⃣ Convert results into a quick lookup map
    const latestMessageMap = new Map(
      latestMessages.map((item) => [
        item._id.toString(),
        item.lastMessage,
      ])
    );

    // 6️⃣ Attach latest message to each contact & arrange the users in the sidebar for which is messaged the lastest 
    const contactsWithMessages = filteredContacts
      .map((contact) => ({
        ...contact.toObject(),
        lastMessage:
          latestMessageMap.get(contact._id.toString()) || null,
      }))
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;

        const bTime = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;

        return bTime - aTime;
      }); 

    
    return NextResponse.json(contactsWithMessages);

  } catch (error) {
    console.error("Get contacts error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
