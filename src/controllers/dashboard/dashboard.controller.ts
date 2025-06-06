import { RequestHandler, Request } from "express";
import { Transaction } from "../../models/transaction.model";
import { createResponse } from "../../utils/apiResponseUtils";

const getDashboardData: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    // Define date ranges
    const weeklyStartDate = new Date();
    weeklyStartDate.setDate(weeklyStartDate.getDate() - 7); // Last 7 days
    weeklyStartDate.setHours(0, 0, 0, 0); // Start of the day

    const monthlyStartDate = new Date();
    monthlyStartDate.setDate(monthlyStartDate.getDate() - 30); // Last 30 days
    monthlyStartDate.setHours(0, 0, 0, 0); // Start of the day

    // 1. Get totals (income, expense, balance)
    const totals = await Transaction.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // 2. Get weekly trend data (daily income and expense for last 7 days)
    const weeklyTrend = await Transaction.aggregate([
      {
        $match: {
          userId,
          createdAt: {
            $gte: weeklyStartDate,
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            type: "$type",
          },
          amount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          date: "$_id",
          income: 1,
          expense: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // 3. Get monthly trend data (daily income and expense for last 30 days)
    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          userId,
          createdAt: {
            $gte: monthlyStartDate,
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            type: "$type",
          },
          amount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $project: {
          date: "$_id",
          income: 1,
          expense: 1,
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // 4. Get category distribution
    const categoryDistribution = await Transaction.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: {
            type: "$type",
            category: "$category.name",
          },
          amount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          categories: {
            $push: {
              category: "$_id.category",
              amount: "$amount",
            },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          type: "$_id",
          categories: {
            $map: {
              input: "$categories",
              as: "cat",
              in: {
                category: "$$cat.category",
                amount: "$$cat.amount",
                percentage: {
                  $multiply: [{ $divide: ["$$cat.amount", "$total"] }, 100],
                },
              },
            },
          },
        },
      },
      {
        $sort: { "categories.amount": -1 },
      },
    ]);

    // Transform the data for frontend consumption
    const result = {
      totals: {
        income: totals.find((t) => t._id === "income")?.total || 0,
        expense: totals.find((t) => t._id === "expense")?.total || 0,
        balance:
          (totals.find((t) => t._id === "income")?.total || 0) -
          (totals.find((t) => t._id === "expense")?.total || 0),
      },
      trend: {
        weekly: weeklyTrend,
        monthly: monthlyTrend,
      },
      categoryDistribution: {
        income:
          categoryDistribution.find((d) => d.type === "income")?.categories ||
          [],
        expense:
          categoryDistribution.find((d) => d.type === "expense")?.categories ||
          [],
      },
    };

    return createResponse(
      res,
      200,
      result,
      null,
      "Dashboard data fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return createResponse(
      res,
      500,
      null,
      "Internal server error",
      "Failed to fetch dashboard data"
    );
  }
};

export const dashboardController = {
  getDashboardData,
};
