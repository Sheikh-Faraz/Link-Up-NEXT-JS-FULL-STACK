
import mongoose from "mongoose";

const forwardHistorySchema = new mongoose.Schema(
  {
    sourceMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      index: true,
    },

    forwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    forwardedMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true,
    },

    forwardedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

forwardHistorySchema.index({
  sourceMessageId: 1,
  forwardedBy: 1,
  forwardedAt: -1,
});

const ForwardHistory =
  mongoose.models.ForwardHistory ||
  mongoose.model("ForwardHistory", forwardHistorySchema);

export default ForwardHistory;


// import mongoose from "mongoose";

// const forwardHistorySchema = new mongoose.Schema(
//   {
//     // The message that the user selected to forward
//     sourceMessageId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Message",
//       required: true,
//       index: true,
//     },

//     // The person who performed the forwarding
//     forwardedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     // The selected recipient
//     recipientId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // The newly created copy delivered to that recipient
//     forwardedMessageId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Message",
//       required: true,
//     },

//     forwardedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// forwardHistorySchema.index({
//   sourceMessageId: 1,
//   forwardedBy: 1,
// });

// const ForwardHistory =
//   mongoose.models.ForwardHistory ||
//   mongoose.model("ForwardHistory", forwardHistorySchema);

// export default ForwardHistory;
