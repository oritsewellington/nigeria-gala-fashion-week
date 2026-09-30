const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const Category = require('../models/Category');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelpers');

// GET /api/categories  (public - only active ones; dashboard passes ?all=true)
exports.getCategories = catchAsync(async (req, res) => {
  const filter = req.query.all === 'true' && req.user ? {} : { isActive: true };

  const categories = await Category.find(filter)
    .sort({ displayOrder: 1, createdAt: 1 })
    .populate('contestantCount');

  sendResponse(res, 200, 'Categories retrieved successfully.', { categories });
});

// GET /api/categories/:slug
exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug }).populate('contestantCount');

  if (!category) {
    return next(new AppError('Category not found.', 404, 'NOT_FOUND'));
  }

  sendResponse(res, 200, 'Category retrieved successfully.', { category });
});

// POST /api/categories  (admin/host)
exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description, displayOrder } = req.body;

  if (!name) {
    return next(new AppError('Category name is required.', 400, 'MISSING_FIELDS'));
  }

  let coverImage = { url: null, publicId: null };
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'categories');
    coverImage = { url: result.secure_url, publicId: result.public_id };
  }

  const category = await Category.create({
    name,
    description,
    displayOrder: displayOrder || 0,
    coverImage,
  });

  sendResponse(res, 201, 'Category created successfully.', { category });
});

// PATCH /api/categories/:id
exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found.', 404, 'NOT_FOUND'));
  }

  const { name, description, displayOrder, isActive } = req.body;
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (displayOrder !== undefined) category.displayOrder = displayOrder;
  if (isActive !== undefined) category.isActive = isActive;

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'categories');
    await deleteFromCloudinary(category.coverImage?.publicId);
    category.coverImage = { url: result.secure_url, publicId: result.public_id };
  }

  await category.save();

  sendResponse(res, 200, 'Category updated successfully.', { category });
});

// DELETE /api/categories/:id
exports.deleteCategory = catchAsync(async (req, res, next) => {
  const Contestant = require('../models/Contestant');
  const contestantCount = await Contestant.countDocuments({ category: req.params.id });

  if (contestantCount > 0) {
    return next(
      new AppError(
        'This category has contestants attached. Remove or reassign them before deleting it.',
        400,
        'CATEGORY_NOT_EMPTY'
      )
    );
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found.', 404, 'NOT_FOUND'));
  }

  await deleteFromCloudinary(category.coverImage?.publicId);
  await category.deleteOne();

  sendResponse(res, 200, 'Category deleted successfully.');
});
