const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/Unauthorized');
const NotFoundError = require('../errors/NotFound');

const User = require('../models/user');

function registerUser(req, res, next) {
  const {
    email,
    password,
    name,
    about,
    avatar,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      const { _id } = user;

      return res.status(201).send({
        email,
        name,
        about,
        avatar,
        _id,
      });
    })
    .catch(next);
}

function loginUser(req, res, next) {
  const { email, password } = req.body;
  const secretSigningKey = 'U2FsdGVkX19nV2KreWqHk1BGD+ojOGgl39N93rtj1DVVSeYcdNPGnAQt4PtU2FvJrEiPtoQRACJ0B/yIORhjvQ==';

  User
    .findUserByCredentials(email, password)
    .then(({ _id: userId }) => {
      if (userId) {
        const token = jwt.sign(
          { userId },
          secretSigningKey,
          { expiresIn: '7d' },
        );

        return res.status(200).send({ _id: token });
      }

      throw new UnauthorizedError('Неправильные почта или пароль');
    })
    .catch(next);
}

function getUsersInfo(_, res, next) {
  User
    .find({})
    .then((users) => res.status(200).send({ users }))
    .catch(next);
}

function getUserInfo(req, res, next) {
  const { id } = req.params;

  User
    .findById(id)
    .then((user) => {
      if (user) return res.status(200).send({ user });

      throw new NotFoundError('Данные по указанному id не найдены');
    })
    .catch(next);
}

function getCurrentUserInfo(req, res, next) {
  const { userId } = req.user;

  User
    .findById(userId)
    .then((user) => {
      if (user) return res.status(200).send({ user });

      throw new NotFoundError('Данные по указанному id не найдены');
    })
    .catch(next);
}

function setUserInfo(req, res, next) {
  const { name, about } = req.body;
  const { userId } = req.user;

  User
    .findByIdAndUpdate(
      userId,
      {
        name,
        about,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => {
      if (user) return res.status(200).send({ user });

      throw new NotFoundError('Данные по указанному id не найдены');
    })
    .catch(next);
}

function setUserAvatar(req, res, next) {
  const { avatar } = req.body;
  const { userId } = req.user;

  User
    .findByIdAndUpdate(
      userId,
      {
        avatar,
      },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => {
      if (user) return res.status(200).send({ user });

      throw new NotFoundError('Данные по указанному id не найдены');
    })
    .catch(next);
}

module.exports = {
  registerUser,
  loginUser,

  getUsersInfo,
  getUserInfo,
  getCurrentUserInfo,

  setUserInfo,
  setUserAvatar,
};
