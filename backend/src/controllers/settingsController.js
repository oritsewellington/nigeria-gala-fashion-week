const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const Settings = require('../models/Settings');
const Category = require('../models/Category');
const Contestant = require('../models/Contestant');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelpers');

// GET /api/settings/public -> only what the public site needs
exports.getPublicSettings = catchAsync(async (req, res) => {
  const settings = await Settings.getSettings();

  sendResponse(res, 200, 'Settings retrieved successfully.', {
    eventName: settings.eventName,
    eventTagline: settings.eventTagline,
    votingStartTime: settings.votingStartTime,
    votingEndTime: settings.votingEndTime,
    votePrice: settings.votePrice,
    heroImages: settings.heroImages,
    votingStatus: settings.getVotingStatus(),
    serverTime: new Date(),
  });
});

// GET /api/settings/public-stats -> live counters for the homepage stats bar.
// Deliberately excludes revenue/money figures - those stay inside the dashboard.
exports.getPublicStats = catchAsync(async (req, res) => {
  const [categoryCount, contestantCount, voteAgg] = await Promise.all([
    Category.countDocuments({ isActive: true }),
    Contestant.countDocuments({ isActive: true }),
    Contestant.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalVotes: { $sum: '$voteCount' } } },
    ]),
  ]);

  sendResponse(res, 200, 'Live stats retrieved successfully.', {
    totalVotes: voteAgg[0]?.totalVotes || 0,
    totalCategories: categoryCount,
    totalContestants: contestantCount,
  });
});

// GET /api/settings  (admin/host - full settings incl. platform share)
exports.getSettings = catchAsync(async (req, res) => {
  const settings = await Settings.getSettings();
  sendResponse(res, 200, 'Settings retrieved successfully.', {
    settings: { ...settings.toObject(), votingStatus: settings.getVotingStatus() },
  });
});

// PATCH /api/settings  (superadmin only)
// New hero images (field name "heroImages", up to 6) are APPENDED to the
// existing set. Use DELETE /api/settings/hero-image/:publicId to remove one.
exports.updateSettings = catchAsync(async (req, res, next) => {
  const settings = await Settings.getSettings();

  const {
    eventName,
    eventTagline,
    votingStartTime,
    votingEndTime,
    votePrice,
    platformSharePercent,
  } = req.body;

  if (votingStartTime && votingEndTime) {
    if (new Date(votingStartTime) >= new Date(votingEndTime)) {
      return next(new AppError('Voting start time must be before the end time.', 400, 'INVALID_DATE_RANGE'));
    }
  }

  if (eventName !== undefined) settings.eventName = eventName;
  if (eventTagline !== undefined) settings.eventTagline = eventTagline;
  if (votingStartTime !== undefined) settings.votingStartTime = votingStartTime;
  if (votingEndTime !== undefined) settings.votingEndTime = votingEndTime;
  if (votePrice !== undefined) settings.votePrice = votePrice;
  if (platformSharePercent !== undefined) settings.platformSharePercent = platformSharePercent;

  if (req.files && req.files.length > 0) {
    if (settings.heroImages.length + req.files.length > 6) {
      return next(new AppError('You can have a maximum of 6 hero images. Remove some before adding more.', 400, 'TOO_MANY_IMAGES'));
    }

    const uploaded = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer, 'settings'))
    );

    settings.heroImages.push(
      ...uploaded.map((result) => ({ url: result.secure_url, publicId: result.public_id }))
    );
  }

  await settings.save();

  sendResponse(res, 200, 'Settings updated successfully.', {
    settings: { ...settings.toObject(), votingStatus: settings.getVotingStatus() },
  });
});

// DELETE /api/settings/hero-image/:publicId  (superadmin only)
exports.deleteHeroImage = catchAsync(async (req, res, next) => {
  const settings = await Settings.getSettings();
  const { publicId } = req.params;

  const exists = settings.heroImages.some((img) => img.publicId === publicId);
  if (!exists) {
    return next(new AppError('Hero image not found.', 404, 'NOT_FOUND'));
  }

  await deleteFromCloudinary(publicId);
  settings.heroImages = settings.heroImages.filter((img) => img.publicId !== publicId);
  await settings.save();

  sendResponse(res, 200, 'Hero image removed successfully.', {
    settings: { ...settings.toObject(), votingStatus: settings.getVotingStatus() },
  });
});
