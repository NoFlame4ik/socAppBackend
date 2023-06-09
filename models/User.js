import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: String,
    role: {
      type: String,
      default: 'user',
    },
    experience: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    completedTasks: [
      {
        type: {
          id: mongoose.Schema.Types.ObjectId,
          title: String,
        },
        ref: 'Task',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('User', UserSchema);
