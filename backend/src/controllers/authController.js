const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

const cookieOptions = () => ({
  expires: new Date(
    Date.now() + (Number(process.env.JWT_COOKIE_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
});

const createAndSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());
  sendResponse(res, statusCode, message, { user: user.toSafeObject(), token });
};

// POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password.', 400, 'MISSING_CREDENTIALS'));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password.', 401, 'INVALID_CREDENTIALS'));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Contact the administrator.', 403, 'ACCOUNT_DEACTIVATED'));
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  createAndSendToken(user, 200, res, 'Logged in successfully.');
});

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  sendResponse(res, 200, 'Logged out successfully.');
};

// GET /api/auth/me
exports.getMe = catchAsync(async (req, res) => {
  sendResponse(res, 200, 'Current user retrieved.', { user: req.user.toSafeObject() });
});

// POST /api/auth/create-host  (superadmin only)
exports.createHost = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new AppError('Name, email and password are required.', 400, 'MISSING_FIELDS'));
  }

  const finalRole = role === 'superadmin' ? 'superadmin' : 'host';

  const user = await User.create({ name, email, password, role: finalRole });

  sendResponse(res, 201, `${finalRole === 'superadmin' ? 'Admin' : 'Host'} account created successfully.`, {
    user: user.toSafeObject(),
  });
});

// GET /api/auth/users  (superadmin only)
exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  sendResponse(res, 200, 'Users retrieved successfully.', {
    users: users.map((u) => u.toSafeObject()),
  });
});

// PATCH /api/auth/users/:id/status  (superadmin only) - activate/deactivate
exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;

  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot deactivate your own account.', 400, 'CANNOT_MODIFY_SELF'));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found.', 404, 'NOT_FOUND'));
  }

  user.isActive = isActive;
  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, `Account ${isActive ? 'activated' : 'deactivated'} successfully.`, {
    user: user.toSafeObject(),
  });
});

// PATCH /api/auth/update-password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide your current and new password.', 400, 'MISSING_FIELDS'));
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Your current password is incorrect.', 401, 'INVALID_CREDENTIALS'));
  }

  user.password = newPassword;
  await user.save();

  createAndSendToken(user, 200, res, 'Password updated successfully.');
});
