const User = require('../models/userModel');
const base = require('./baseController');
const userUtil = require('../utils/userUtil');
const { ErrorHandler } = require('../utils/errorHandler');

exports.signup = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      throw new ErrorHandler(400, 'Missing required name and email parameters');
    }

    const secret = userUtil.getSecret();
    const hash = userUtil.getRandom();

    const dbResult = await User.create({
      name: name,
      email: email,
      secret: secret,
      hash: hash,
      active: false
    });

    res.status(200).json({
      status: 'success',
      data: hash,
    });
  } catch (error) {
    next(error);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { email, hash } = req.body;
    if (!email || !hash) {
      throw new ErrorHandler(400, 'Missing required email and hash parameters');
    }

    var dbUser = await User.findOne({
      email,
    }).select('+secret');

    if(dbUser && dbUser.active) {
      return next(
        new ErrorHandler(403, 'User email has already been verified'),
        req,
        res,  
        next
      );
    }

    if (!dbUser || !(await userUtil.verifyHash(hash, dbUser.hash))) {
      return next(
        new ErrorHandler(401, 'Email or hash is wrong'),
        req,
        res,  
        next
      );
    }

    const secretQRCode = await userUtil.getQRCode(email, dbUser.secret);

    dbUser = await User.findByIdAndUpdate(dbUser._id, {
      hash: "",
      active: true,
    });

    res.status(200).json({
      status: 'success',
      data: secretQRCode
    });

  } catch (error) {
    next(error);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      active: false,
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = base.getAll(User);
exports.getUser = base.getOne(User);

// Don't update password on this
exports.updateUser = base.updateOne(User);
exports.deleteUser = base.deleteOne(User);
