import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';
// import User from "../models/User.js";

const makeUserAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findByIdAndUpdate(id, { role: 'admin' }, { new: true });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { makeUserAdmin };

// export const authenticate = (req, res, next) => {
//   const token = req.headers.authorization;
//
//   if (!token) {
//     return res.status(401).json({ message: 'Токен доступу не надано' });
//   }
//
//   try {
//     const decoded = jwt.verify(token, 'secret123');
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(403).json({ message: 'Недійсний токен доступу' });
//   }
// };

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Користувач із такою поштою уже зареєстрований',
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Користвуча не було знайдено',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Невірний логін або пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не вдалося авторизуватися',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'Користувача не було найдено',
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Немає доступу',
    });
  }
};
export const updateMe = async (req, res) => {
  const user = await UserModel.findById(req.userId);
  const {fullName} = req.body;
  // Перевірка ролі користувача
  if (!!user || user?.role === 'admin') {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.userId,
        {fullName},
        {new: true}
      );
      if (!updatedUser) {
        res.status(404).json({message: 'User not found'});
        return;
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  } else {
    res.status(403).json({message: 'Недостатньо прав для оновлення задачі'});
  }
};

export const getUsersSortByPoints = async (req, res) => {
  try {
    const users = await UserModel.find();
    /** By default sort by DESC createdAt */
    res.json(users
      /** Sort by fullName */
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      /** And then by points */
      .sort((a, b) => b.points - a.points));
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
