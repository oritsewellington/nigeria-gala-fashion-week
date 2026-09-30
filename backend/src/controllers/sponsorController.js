const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const Sponsor = require('../models/Sponsor');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryHelpers');

// GET /api/sponsors  (public - active only; dashboard passes ?all=true)
exports.getSponsors = catchAsync(async (req, res) => {
  const filter = req.query.all === 'true' && req.user ? {} : { isActive: true };
  const sponsors = await Sponsor.find(filter).sort({ displayOrder: 1, createdAt: 1 });
  sendResponse(res, 200, 'Sponsors retrieved successfully.', { sponsors });
});

// POST /api/sponsors  (admin/host)
exports.createSponsor = catchAsync(async (req, res, next) => {
  const { name, websiteUrl, displayOrder } = req.body;

  if (!name) {
    return next(new AppError('Sponsor name is required.', 400, 'MISSING_FIELDS'));
  }
  if (!req.file) {
    return next(new AppError('A sponsor logo is required.', 400, 'MISSING_LOGO'));
  }

  const result = await uploadBufferToCloudinary(req.file.buffer, 'sponsors');

  const sponsor = await Sponsor.create({
    name,
    websiteUrl,
    displayOrder: displayOrder || 0,
    logo: { url: result.secure_url, publicId: result.public_id },
  });

  sendResponse(res, 201, 'Sponsor added successfully.', { sponsor });
});

// PATCH /api/sponsors/:id
exports.updateSponsor = catchAsync(async (req, res, next) => {
  const sponsor = await Sponsor.findById(req.params.id);
  if (!sponsor) {
    return next(new AppError('Sponsor not found.', 404, 'NOT_FOUND'));
  }

  const { name, websiteUrl, displayOrder, isActive } = req.body;
  if (name !== undefined) sponsor.name = name;
  if (websiteUrl !== undefined) sponsor.websiteUrl = websiteUrl;
  if (displayOrder !== undefined) sponsor.displayOrder = displayOrder;
  if (isActive !== undefined) sponsor.isActive = isActive;

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'sponsors');
    await deleteFromCloudinary(sponsor.logo?.publicId);
    sponsor.logo = { url: result.secure_url, publicId: result.public_id };
  }

  await sponsor.save();

  sendResponse(res, 200, 'Sponsor updated successfully.', { sponsor });
});

// DELETE /api/sponsors/:id
exports.deleteSponsor = catchAsync(async (req, res, next) => {
  const sponsor = await Sponsor.findById(req.params.id);
  if (!sponsor) {
    return next(new AppError('Sponsor not found.', 404, 'NOT_FOUND'));
  }

  await deleteFromCloudinary(sponsor.logo?.publicId);
  await sponsor.deleteOne();

  sendResponse(res, 200, 'Sponsor deleted successfully.');
});
