import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';

import mongoose from 'mongoose';

import {registerValidation, loginValidation, postCreateValidation} from './validations.js';

import {handleValidationErrors, checkAuth} from './utils/index.js';

import {UserController, PostController, TaskController, CommentController} from './controllers/index.js';


mongoose
  .connect(process.env.MONGODB_URI || 'mongodb+srv://root:123qwe@atlascluster.yp3frzh.mongodb.net/socialapp?retryWrites=true&w=majority')
  .then(() => console.log('DB doing fine'))
  .catch((err) => console.log('DB feeling weak', err));

const app = express();
app.patch('/users/:id/admin', UserController.makeUserAdmin);

// Оновлений код fetch
// const id = '64734633572da237fcb26240'; // Замініть це значення на потрібний ідентифікатор користувача
// fetch('http://localhost:4000/users/' + id + '/admin', {
//   method: 'PATCH',
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDczNDYzMzU3MmRhMjM3ZmNiMjYyNDAiLCJpYXQiOjE2ODUyNzYyMjQsImV4cCI6MTY4Nzg2ODIyNH0.zJ7r2zRcnLiCAyHy5cmYcuZITTw9xmZXEsgYvcmyT9I'
//   }
// })
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error(error));

app.use(express.json());
app.get('/tasks', TaskController.getAllTasks);
app.post('/tasks/:id/comment', checkAuth, CommentController.createComment);
app.get('/tasks/:id',  TaskController.getTaskById);
app.post('/tasks', checkAuth, TaskController.createTask);
app.patch('/tasks/:id', checkAuth, TaskController.updateTask);
app.delete('/tasks/:id',checkAuth, TaskController.deleteTask);
app.post('/tasks/:id/complete',checkAuth, TaskController.completeTask);
app.get('/usersByPoints', UserController.getUsersSortByPoints);

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({storage});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);
app.patch('/profile', checkAuth, UserController.updateMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);


app.listen(process.env.PORT || 4000, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server doing fine');
});
