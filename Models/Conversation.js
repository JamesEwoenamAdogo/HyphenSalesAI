import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Conversation",
    },

  },
  {
    timestamps: true,
  }
);


export default mongoose.model(
  "Conversation",
  conversationSchema
);