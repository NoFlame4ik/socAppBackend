import Task from '../models/task.js';
import UserModel from "../models/User.js";
import PostModel from "../models/Post.js";
// import authenticate from '../utils/checkAuth.js';

// Отримати всі задачі
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    /** By default sort by DESC createdAt */
    res.json(tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .sort((a, b) => a.completed - b.completed));
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

const createTask = async (req, res) => {
  const {title, description, points, experience} = req.body;
  const user = await UserModel.findById(res.req.userId);
  // Перевірка ролі користувача
  if (!!user && user?.role === 'admin') {
    try {
      const newTask = await Task.create({
        title,
        description,
        points,
        experience,
        completed: false,
        createdBy: user._id
      });
      res.status(201).json(newTask);
    } catch (error) {
      res.status(400).json({message: error.message});
    }
  } else {
    res.status(403).json({message: 'Недостатньо прав для створення задачі'});
  }
};

// Отримати одну задачу за ідентифікатором
const getTaskById = async (req, res) => {
  const {id} = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({message: 'Task not found'});
      return;
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// Оновити задачу
const updateTask = async (req, res) => {
  const {id} = req.params;
  const {title, description, points, experience} = req.body;

  const user = await UserModel.findById(res.req.userId);
  // Перевірка ролі користувача
  if (!!user && user?.role === 'admin') {
    try {
      // const updatedTask = await Task.updateOne(
      //   {
      //     _id: id,
      //   },
      //   {title, description, points, experience},
      // );
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        {title, description, points, experience},
        {new: true}
      );
      if (!updatedTask) {
        res.status(404).json({message: 'Task not found'});
        return;
      }
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  } else {
    res.status(403).json({message: 'Недостатньо прав для оновлення задачі'});
  }
};

// Видалити задачу
const deleteTask = async (req, res) => {
  const {id} = req.params;
  const user = await UserModel.findById(res.req.userId);
  // Перевірка ролі користувача
  if (!!user && user?.role === 'admin') {
    try {
      const deletedTask = await Task.findByIdAndDelete(id);
      if (!deletedTask) {
        res.status(404).json({message: 'Task not found'});
        return;
      }
      res.json({message: 'Task deleted'});
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  } else {
    res.status(403).json({message: 'Недостатньо прав для видалення задачі'});
  }
};

const completeTask = async (req, res) => {
  const {id} = req.params;
  const userId = req.userId;

  try {
    // Отримати задачу за ідентифікатором
    const updatedTask = await Task.findByIdAndUpdate(
        id,
        {completed: true},
        // {new: true}
    );
    if (!updatedTask) {
      res.status(404).json({message: 'Task not found'});
      return;
    }

    // Отримати користувача за ідентифікатором
    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({message: 'User not found'});
      return;
    }

    // Перевірити, чи користувач вже виконав цю задачу
    if (!!user.completedTasks?.find((task) => task?.id?.equals(id))) {
      res.status(400).json({message: 'Task already completed by the user'});
      return;
    }

    // Оновити список виконаних завдань користувача
    user.completedTasks.push({id, title:updatedTask.title});
    await user.save();

    // Додати очки та досвід користувачеві
    user.points += updatedTask.points;
    user.experience += updatedTask.experience;
    await user.save();

    res.json({message: 'Task completed successfully'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export default {
  getAllTasks,
  createTask, // Використання middleware authenticate перед createTask
  getTaskById,
  updateTask, // Використання middleware authenticate перед updateTask
  deleteTask,// Використання middleware authenticate перед deleteTask
  completeTask
};