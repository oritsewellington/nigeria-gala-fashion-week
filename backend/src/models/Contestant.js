const mongoose = require('mongoose');

const contestantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Contestant's name is required"],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    contestantNumber: {
      type: String, // e.g. "M-014" so hosts can reference offline too
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    instagramHandle: {
      type: String,
      trim: true,
      default: '',
    },
    photo: {
      url: { type: String, required: [true, 'Contestant photo is required'] },
      publicId: { type: String, required: true },
    },
    gallery: [
      {
        url: String,
        publicId: String,
      },
    ],
    voteCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

contestantSchema.index({ category: 1, voteCount: -1 });

module.exports = mongoose.model('Contestant', contestantSchema);
