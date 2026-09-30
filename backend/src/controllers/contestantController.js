const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const Contestant = require('../models/Contestant');
const Category = require('../models/Category');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelpers');

// GET /api/contestants?category=slug&search=&page=&limit=
exports.getContestants = catchAsync(async (req, res, next) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const filter = req.user ? {} : { isActive: true };

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc) {
      return next(new AppError('Category not found.', 404, 'NOT_FOUND'));
    }
    filter.category = categoryDoc._id;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [contestants, total] = await Promise.all([
    Contestant.find(filter)
      .populate('category', 'name slug')
      .sort({ voteCount: -1, createdAt: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Contestant.countDocuments(filter),
  ]);

  sendResponse(res, 200, 'Contestants retrieved successfully.', { contestants }, {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// GET /api/contestants/leaderboard/:categorySlug -> ranked list for one category
exports.getLeaderboardByCategory = catchAsync(async (req, res, next) => {
  const categoryDoc = await Category.findOne({ slug: req.params.categorySlug });
  if (!categoryDoc) {
    return next(new AppError('Category not found.', 404, 'NOT_FOUND'));
  }

  const contestants = await Contestant.find({ category: categoryDoc._id, isActive: true }).sort({
    voteCount: -1,
    createdAt: 1,
  });

  const totalVotes = contestants.reduce((sum, c) => sum + c.voteCount, 0);

  const ranked = contestants.map((c, index) => ({
    id: c._id,
    name: c.name,
    photo: c.photo,
    contestantNumber: c.contestantNumber,
    voteCount: c.voteCount,
    percentage: totalVotes > 0 ? Number(((c.voteCount / totalVotes) * 100).toFixed(1)) : 0,
    rank: index + 1,
  }));

  sendResponse(res, 200, 'Leaderboard retrieved successfully.', {
    category: { id: categoryDoc._id, name: categoryDoc.name, slug: categoryDoc.slug },
    totalVotes,
    contestants: ranked,
  });
});

// GET /api/contestants/:id
exports.getContestant = catchAsync(async (req, res, next) => {
  const contestant = await Contestant.findById(req.params.id).populate('category', 'name slug');

  if (!contestant) {
    return next(new AppError('Contestant not found.', 404, 'NOT_FOUND'));
  }

  sendResponse(res, 200, 'Contestant retrieved successfully.', { contestant });
});

// POST /api/contestants  (admin/host)
exports.createContestant = catchAsync(async (req, res, next) => {
  const { name, category, bio, instagramHandle, contestantNumber } = req.body;

  if (!name || !category) {
    return next(new AppError('Name and category are required.', 400, 'MISSING_FIELDS'));
  }

  if (!req.file) {
    return next(new AppError('A contestant photo is required.', 400, 'MISSING_PHOTO'));
  }

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    return next(new AppError('Selected category does not exist.', 400, 'INVALID_CATEGORY'));
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, 'contestants');

  const contestant = await Contestant.create({
    name,
    category,
    bio,
    instagramHandle,
    contestantNumber,
    photo: { url: result.secure_url, publicId: result.public_id },
  });

  sendResponse(res, 201, 'Contestant added successfully.', { contestant });
});

// PATCH /api/contestants/:id
exports.updateContestant = catchAsync(async (req, res, next) => {
  const contestant = await Contestant.findById(req.params.id);
  if (!contestant) {
    return next(new AppError('Contestant not found.', 404, 'NOT_FOUND'));
  }

  const { name, category, bio, instagramHandle, contestantNumber, isActive } = req.body;

  if (category) {
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return next(new AppError('Selected category does not exist.', 400, 'INVALID_CATEGORY'));
    }
    contestant.category = category;
  }

  if (name !== undefined) contestant.name = name;
  if (bio !== undefined) contestant.bio = bio;
  if (instagramHandle !== undefined) contestant.instagramHandle = instagramHandle;
  if (contestantNumber !== undefined) contestant.contestantNumber = contestantNumber;
  if (isActive !== undefined) contestant.isActive = isActive;

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'contestants');
    await deleteFromCloudinary(contestant.photo?.publicId);
    contestant.photo = { url: result.secure_url, publicId: result.public_id };
  }

  await contestant.save();

  sendResponse(res, 200, 'Contestant updated successfully.', { contestant });
});

// DELETE /api/contestants/:id
exports.deleteContestant = catchAsync(async (req, res, next) => {
  const contestant = await Contestant.findById(req.params.id);
  if (!contestant) {
    return next(new AppError('Contestant not found.', 404, 'NOT_FOUND'));
  }

  await deleteFromCloudinary(contestant.photo?.publicId);
  await contestant.deleteOne();

  sendResponse(res, 200, 'Contestant deleted successfully.');
});
