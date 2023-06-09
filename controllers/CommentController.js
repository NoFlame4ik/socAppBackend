import Task from '../models/task.js';
import UserModel from "../models/User.js";
import Comment from "../models/Comment.js";

export const createComment = async (req, res) => {
  const {text} = req.body;
  const taskId = req?.params?.id;
  const user = await UserModel.findById(req.userId);
  // Перевірка ролі користувача
  if (!!user) {
    try {
      const newComment = await Comment.create({
        text,
        createdBy: user._id,
        taskId,
      });
      const task = await Task.findById(taskId);
      await task.comments.push({...newComment?._doc, createdBy:user});
      await task.save();
      res.status(201).json(newComment);
    } catch (error) {
      res.status(400).json({message: error.message});
    }
  } else {
    res.status(403).json({message: 'Недостатньо прав для створення коментаря'});
  }
};