import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      default: "",
    },

    filePublicId: {
      type: String,
      default: "",
    },

    fileResourceType: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);


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

    fileName: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },

    fileType: {
      type: String,
      default: "",
    },

    filePublicId: {
      type: String,
      default: "",
    },

    fileResourceType: {
      type: String,
      default: "",
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    isEdited: { type: Boolean, default: false },

    isDeletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    // For Forwarding Message
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // The original message from which this forwarding chain started
    forwardedFromMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // The user who forwarded this particular copy
    forwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // To show that it was forwarded
    isForwarded: {
      type: Boolean,
      default: false,
    },


    // For Replying
    replyTo: [
      {
        text: String,

        fileUrl: {
          type: String,
          default: "",
        },

        fileType: {
          type: String,
          default: "",
        },

        fileName: {
          type: String,
          default: "",
        },

        filePublicId: {
          type: String,
          default: "",
        },

        fileResourceType: {
          type: String,
          default: "",
        },
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
