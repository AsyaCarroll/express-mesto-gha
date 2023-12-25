const mongoose = require('mongoose');
const Card = require('../models/card');

const handleError = (res, error, statusCode) => res.status(statusCode).json({ message: error });

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).json(cards))
    .catch((err) => handleError(res, err.error, 500));
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;
  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(201).json(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        handleError(res, 'Переданы некорректные данные при создании карточки', 400);
      } else {
        handleError(res, err.error, 500);
      }
    });
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return handleError(res, 'Переданы некорректные данные при создании карточки', 400);
  }
  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        handleError(res, 'Карточка не найдена', 404);
      } else {
        res.status(200).json(card);
      }
    })
    .catch((err) => handleError(res, err.error, 500));
};

const likeCard = async (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return handleError(res, 'Переданы некорректные данные для постановки лайка. ', 400);
  }

  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      handleError(res, 'Передан несуществующий ID карточки', 404);
    } else {
      res.status(200).json(card);
    }
  } catch (error) {
    handleError(res, 'Ошибка на стороне сервера', 500);
  }
};

const dislikeCard = async (req, res) => {
  const { cardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return handleError(res, 'Переданы некорректные данные для снятии лайка. ', 400);
  }

  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      handleError(res, 'Передан несуществующий ID карточки', 404);
    } else {
      res.status(200).json(card);
    }
  } catch (error) {
    handleError(res, 'Ошибка на стороне сервера', 500);
  }
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
