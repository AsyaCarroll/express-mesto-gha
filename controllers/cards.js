const mongoose = require('mongoose');
const Card = require('../models/card');

// eslint-disable-next-line max-len
const handleErrorResponse = (res, error, statusCode) => res.status(statusCode).json({ message: error });

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).json(cards))
    .catch((err) => handleErrorResponse(res, err.error, 500));
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(201).json(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        handleErrorResponse(res, 'Переданы некорректные данные в метод создания карточки', 400);
      } else {
        handleErrorResponse(res, err.error, 500);
      }
    });
};

// eslint-disable-next-line consistent-return
const deleteCard = (req, res) => {
  const { cardId } = req.params;

  // Проверка валидности ObjectId
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return handleErrorResponse(res, 'Переданы некорректные данные при создании карточки', 400);
  }

  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        handleErrorResponse(res, 'Карточка не найдена', 404);
      } else {
        res.status(200).json(card);
      }
    })
    .catch((err) => handleErrorResponse(res, err.error, 500));
};

// eslint-disable-next-line consistent-return
const likeCard = async (req, res) => {
  const { cardId } = req.params;

  // Проверка валидности ObjectId
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return handleErrorResponse(res, 'Некорректный формат ID карточки', 400);
  }

  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      handleErrorResponse(res, 'Карточка не найдена', 404);
    } else {
      res.status(200).json(card);
    }
  } catch (error) {
    handleErrorResponse(res, 'Ошибка на стороне сервера', 500);
  }
};

// eslint-disable-next-line consistent-return
const dislikeCard = async (req, res) => {
  const { cardId } = req.params;

  // Проверка валидности ObjectId
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return handleErrorResponse(res, 'Некорректный формат ID карточки', 400);
  }

  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      handleErrorResponse(res, 'Карточка не найдена', 404);
    } else {
      res.status(200).json(card);
    }
  } catch (error) {
    handleErrorResponse(res, 'Ошибка на стороне сервера', 500);
  }
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
