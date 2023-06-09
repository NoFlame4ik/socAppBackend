import mongoose from 'mongoose';
import UserModel from "./User.js";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  //   TODO add status
      completed: {
          type: Boolean,
          required: true,
      },
    comments: [
      {
        type: {
          createdAt: String,
          id: mongoose.Schema.Types.ObjectId,
          text: String,
          createdBy: {
            type: {
              id: mongoose.Schema.Types.ObjectId,
              fullName: String,
              email: String,
            },
            ref: 'User'
          }
        },
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Task', TaskSchema);