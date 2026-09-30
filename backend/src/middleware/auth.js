const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please log in to access this resource.",
        401,
        "NOT_AUTHENTICATED",
      ),
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this session no longer exists.",
        401,
        "USER_NOT_FOUND",
      ),
    );
  }

  if (!currentUser.isActive) {
    return next(
      new AppError(
        "Your account has been deactivated. Contact the administrator.",
        403,
        "ACCOUNT_DEACTIVATED",
      ),
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Your password was changed recently. Please log in again.",
        401,
        "PASSWORD_CHANGED",
      ),
    );
  }

  req.user = currentUser;
  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action.",
          403,
          "FORBIDDEN",
        ),
      );
    }
    next();
  };

module.exports = { signToken, protect, restrictTo };
