const mongoose = require('mongoose');

/**
 * Singleton document (only one should ever exist) holding
 * event-wide configuration: name, voting window, price, split.
 */
const settingsSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      default: 'Nigeria Gala Fashion Week',
    },
    eventTagline: {
      type: String,
      default: 'Redefining fashion through our own heritage and identity.',
    },
    votingStartTime: {
      type: Date,
      required: [true, 'Voting start time is required'],
    },
    votingEndTime: {
      type: Date,
      required: [true, 'Voting end time is required'],
    },
    votePrice: {
      type: Number,
      default: 100, // NGN per vote
      min: 1,
    },
    platformSharePercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    // Multiple images for the homepage hero slider. First uploaded = first shown.
    heroImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

settingsSchema.statics.getSettings = async function getSettings() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      votingStartTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      votingEndTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });
  }
  return settings;
};

/**
 * Derives the current voting status purely from server time.
 * Never trust a client-supplied clock for this.
 */
settingsSchema.methods.getVotingStatus = function getVotingStatus() {
  const now = Date.now();
  const start = new Date(this.votingStartTime).getTime();
  const end = new Date(this.votingEndTime).getTime();

  if (now < start) return 'upcoming';
  if (now >= start && now < end) return 'live';
  return 'ended';
};

module.exports = mongoose.model('Settings', settingsSchema);
