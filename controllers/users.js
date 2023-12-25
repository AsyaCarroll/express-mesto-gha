const { Types } = require('mongoose');
const User = require('../models/user');

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
};

// eslint-disable-next-line consistent-return
const getUserById = async (req, res) => {
  const { userId } = req.params;

  if (!Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Передан некорректный идентификатор пользователя' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
};

const createUser = async (req, res) => {
  const { name, about, avatar } = req.body;
  try {
    const user = await User.create({ name, about, avatar });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Переданы некорректные данные при создании пользователя' });
  }
};

// eslint-disable-next-line consistent-return
const updateUser = async (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  try {
    if (name && (name.length < 2 || name.length > 30)) {
      return res.status(400).json({ message: 'Переданы некорректные данные при обновлении профиля' });
    }

    if (about && (about.length < 2 || about.length > 30)) {
      return res.status(400).json({ message: 'Переданы некорректные данные при обновлении профиля' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Пользователь с указанным _id не найден' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
};

const updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true },
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'Пользователь с указанным _id не найден' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
};

module.exports = {
  getUsers, getUserById, createUser, updateUser, updateAvatar,
};
