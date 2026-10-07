const catchAsync = require("../utils/catchAsync");
const sendResponse = require("../utils/sendResponse");

const Transaction = require("../models/Transaction");
const Contestant = require("../models/Contestant");
const Category = require("../models/Category");
const Settings = require("../models/Settings");

// GET /api/dashboard/overview
exports.getOverview = catchAsync(async (req, res) => {
  const successFilter = {
    status: "success",
  };

  const [totals, categoryCount, contestantCount, settings, topContestants] =
    await Promise.all([
      Transaction.aggregate([
        {
          $match: successFilter,
        },

        {
          $group: {
            _id: null,

            totalVotes: {
              $sum: "$voteQuantity",
            },

            // What customers actually paid.
            grossRevenue: {
              $sum: "$amount",
            },

            // Actual Paystack fees.
            paystackFees: {
              $sum: {
                $ifNull: ["$paystackFeeAmount", 0],
              },
            },

            // Money remaining after Paystack.
            netRevenue: {
              $sum: {
                $ifNull: ["$netAmount", 0],
              },
            },

            platformShare: {
              $sum: "$platformShareAmount",
            },

            hostShare: {
              $sum: "$hostShareAmount",
            },

            transactionCount: {
              $sum: 1,
            },
          },
        },
      ]),

      Category.countDocuments({
        isActive: true,
      }),

      Contestant.countDocuments({
        isActive: true,
      }),

      Settings.getSettings(),

      Contestant.find({
        isActive: true,
      })
        .sort({
          voteCount: -1,
        })
        .limit(5)
        .populate("category", "name slug"),
    ]);

  const summary = totals[0] || {
    totalVotes: 0,
    grossRevenue: 0,
    paystackFees: 0,
    netRevenue: 0,
    platformShare: 0,
    hostShare: 0,
    transactionCount: 0,
  };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const dailyTrend = await Transaction.aggregate([
    {
      $match: {
        status: "success",

        paidAt: {
          $gte: sevenDaysAgo,
        },
      },
    },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$paidAt",
          },
        },

        votes: {
          $sum: "$voteQuantity",
        },

        grossRevenue: {
          $sum: "$amount",
        },

        paystackFees: {
          $sum: {
            $ifNull: ["$paystackFeeAmount", 0],
          },
        },

        netRevenue: {
          $sum: {
            $ifNull: ["$netAmount", 0],
          },
        },

        platformShare: {
          $sum: "$platformShareAmount",
        },

        hostShare: {
          $sum: "$hostShareAmount",
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  sendResponse(res, 200, "Dashboard overview retrieved successfully.", {
    ...summary,

    // Keep this alias temporarily so any old
    // frontend code using totalRevenue does not break.
    totalRevenue: summary.grossRevenue,

    platformSharePercent: settings.platformSharePercent,

    categoryCount,

    contestantCount,

    votingStatus: settings.getVotingStatus(),

    votingStartTime: settings.votingStartTime,

    votingEndTime: settings.votingEndTime,

    topContestants,

    dailyTrend,
  });
});

// GET /api/dashboard/transactions
exports.getTransactions = catchAsync(async (req, res) => {
  const { status, category, page = 1, limit = 25, search } = req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      {
        reference: {
          $regex: search,
          $options: "i",
        },
      },

      {
        payerEmail: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("contestant", "name photo")
      .populate("category", "name slug")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(Number(limit)),

    Transaction.countDocuments(filter),
  ]);

  sendResponse(
    res,
    200,
    "Transactions retrieved successfully.",
    {
      transactions,
    },
    {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  );
});

// GET /api/dashboard/payouts
exports.getPayoutSummary = catchAsync(async (req, res) => {
  const result = await Transaction.aggregate([
    {
      $match: {
        status: "success",
      },
    },

    {
      $group: {
        _id: null,

        grossRevenue: {
          $sum: "$amount",
        },

        paystackFees: {
          $sum: {
            $ifNull: ["$paystackFeeAmount", 0],
          },
        },

        netRevenue: {
          $sum: {
            $ifNull: ["$netAmount", 0],
          },
        },

        platformShare: {
          $sum: "$platformShareAmount",
        },

        hostShare: {
          $sum: "$hostShareAmount",
        },

        totalVotes: {
          $sum: "$voteQuantity",
        },
      },
    },
  ]);

  const byCategory = await Transaction.aggregate([
    {
      $match: {
        status: "success",
      },
    },

    {
      $group: {
        _id: "$category",

        grossRevenue: {
          $sum: "$amount",
        },

        paystackFees: {
          $sum: {
            $ifNull: ["$paystackFeeAmount", 0],
          },
        },

        netRevenue: {
          $sum: {
            $ifNull: ["$netAmount", 0],
          },
        },

        platformShare: {
          $sum: "$platformShareAmount",
        },

        hostShare: {
          $sum: "$hostShareAmount",
        },

        totalVotes: {
          $sum: "$voteQuantity",
        },
      },
    },

    {
      $lookup: {
        from: "categories",

        localField: "_id",

        foreignField: "_id",

        as: "category",
      },
    },

    {
      $unwind: "$category",
    },

    {
      $project: {
        _id: 0,

        categoryId: "$category._id",

        categoryName: "$category.name",

        grossRevenue: 1,

        paystackFees: 1,

        netRevenue: 1,

        platformShare: 1,

        hostShare: 1,

        totalVotes: 1,
      },
    },

    {
      $sort: {
        grossRevenue: -1,
      },
    },
  ]);

  const settings = await Settings.getSettings();

  sendResponse(res, 200, "Payout summary retrieved successfully.", {
    platformSharePercent: settings.platformSharePercent,

    summary: result[0] || {
      grossRevenue: 0,
      paystackFees: 0,
      netRevenue: 0,
      platformShare: 0,
      hostShare: 0,
      totalVotes: 0,
    },

    byCategory,
  });
});
