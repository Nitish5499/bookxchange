const otplib = require('otplib');
const qrcode = require('qrcode');
const crypto = require('crypto');
const constants = require('../config/constants');

exports.getSecret = () => {
  try {
    return otplib.authenticator.generateSecret();
  } catch (err) {
    return console.error(err);
  }
};

exports.getOTP = (secret) => {
  try {
    return otplib.authenticator.generate(secret);
  } catch (err) {
    return console.error(err);
  }
};

exports.getRandom = () => {
  try {
    return crypto.randomBytes(constants.HASH_LENGTH).toString('hex');
  } catch (err) {
    return console.error(err);
  }
};

exports.getQRCode = (user, secret) => {
  const otpauth = otplib.authenticator.keyuri(user, process.env.APP_NAME, secret);

  try {
    return qrcode.toDataURL(otpauth);
  } catch (err) {
    return console.error(err);
  }
};

exports.verifyOTP = async function (typedOTP, secret) {
  return otplib.authenticator.check(typedOTP, secret);
};

exports.verifyHash = async function (typedHash, originalHash) {
  return typedHash == originalHash;
};
