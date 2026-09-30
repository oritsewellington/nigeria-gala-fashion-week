const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sponsor name is required'],
      trim: true,
      maxlength: [100, 'Sponsor name cannot exceed 100 characters'],
    },
    logo: {
      url: { type: String, required: [true, 'Sponsor logo is required'] },
      publicId: { type: String, required: true },
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sponsor', sponsorSchema);
