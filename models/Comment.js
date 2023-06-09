import mongoose from 'mongoose';
import UserSchema from "./User.js";

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Comment', CommentSchema);
