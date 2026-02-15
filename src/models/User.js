import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    UserId: {
      type: String,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    about: {
      type: String,
      default: "",
    },

    passwordHash: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
      required: function () {
        return this.provider === "local";
      },
    },

    profilePic: {
      type: String,
      default: "",
    },

    blockedUsers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    isDeletedFor: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true } // ✅ Adds createdAt and updatedAt
);

// ✅ Prevent model overwrite in dev mode
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
