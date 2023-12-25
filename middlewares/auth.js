const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/Unauthorized');

module.exports = (req, _, next) => {
  const { authorization } = req.headers;
  const secretSigningKey = 'U2FsdGVkX19nV2KreWqHk1BGD+ojOGgl39N93rtj1DVVSeYcdNPGnAQt4PtU2FvJrEiPtoQRACJ0B/yIORhjvQ==';
  const bearer = 'Bearer ';

  if (!authorization || !authorization.startsWith(bearer)) {
    return next(new UnauthorizedError('Неправильные почта или пароль'));
  }

  const token = authorization.replace(bearer, '');
  let payload;

  try {
    payload = jwt.verify(token, secretSigningKey);
  } catch (err) {
    return next(new UnauthorizedError('Неправильные почта или пароль'));
  }

  req.user = payload;

  return next();
};
