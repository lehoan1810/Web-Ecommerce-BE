const jwt = require('jsonwebtoken');
const moment = require('moment');
const Token = require('../models/tokenModel');


const generateToken = (userId, expires, type, secret = process.env.JWT_SECRET) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
  };
  return jwt.sign(payload, secret);
};


const saveToken = async (token, userId, expires) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
  });
  return tokenDoc;
};


const verifyToken = async (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const tokenDoc = await Token.findOne({ token, user: payload.sub });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(60, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires);
  await saveToken(verifyEmailToken, user.id, expires);
  return verifyEmailToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateVerifyEmailToken,
};