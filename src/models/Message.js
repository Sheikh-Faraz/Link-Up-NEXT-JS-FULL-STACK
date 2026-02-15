import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },

    fileName: { type: String }, // stores uploaded file name
    fileUrl: { type: String },  // stores uploaded file path or URL
    fileType: { type: String }, // "image/png", "application/pdf", etc.

    // Edit/Delete
    isEdited: { type: Boolean, default: false },
    isDeletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Forward / Reply
    forwardedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    replyTo: [
      {
        text: String,
        fileUrl: { type: String },
        fileType: { type: String },
        fileName: { type: String },
      },
    ],

    // Reactions
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String },
      },
    ],

    // Seen / Read
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// ✅ Prevent model overwrite in dev mode
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
