const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    contestant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contestant",
      required: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    voteQuantity: {
      type: Number,
      required: true,
      min: [1, "Must purchase at least 1 vote"],
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    // Amount paid by the customer BEFORE Paystack fees.
    // This remains the gross transaction amount.
    amount: {
      type: Number,
      required: true,
    },

    // Actual Paystack fee charged for this transaction.
    // Stored in Naira.
    paystackFeeAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    // Gross amount minus Paystack fee.
    // This is the amount that gets split between host/platform.
    netAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    platformSharePercent: {
      type: Number,
      required: true,
    },

    // Platform share is calculated from NET amount.
    platformShareAmount: {
      type: Number,
      required: true,
    },

    // Host share is calculated from NET amount.
    hostShareAmount: {
      type: Number,
      required: true,
    },

    payerName: {
      type: String,
      trim: true,
      default: "",
    },

    payerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    payerPhone: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },

    paystackChannel: {
      type: String,
      default: null,
    },

    gatewayResponse: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Transaction", transactionSchema);
