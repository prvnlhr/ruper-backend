import { RequestHandler } from "express";
import { createResponse } from "../../utils/apiResponseUtils";
import { Transaction } from "../../models/transaction.model";
import { User } from "../../models/user.model";

const addTransaction: RequestHandler = async (req, res) => {
  try {
    const { userId, type, amount, category, description } = req.body;

    // Validate required fields
    if (!userId || !type || !amount || !category) {
      return createResponse(
        res,
        400,
        null,
        "Missing required fields",
        "Please provide userId, type, amount, and category"
      );
    }

    // Validate user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return createResponse(
        res,
        404,
        null,
        "User not found",
        "The specified user does not exist"
      );
    }

    // Validate transaction type
    if (!["income", "expense"].includes(type)) {
      return createResponse(
        res,
        400,
        null,
        "Invalid transaction type",
        "Transaction type must be either 'income' or 'expense'"
      );
    }

    // Validate amount is positive number
    if (typeof amount !== "number" || amount <= 0) {
      return createResponse(
        res,
        400,
        null,
        "Invalid amount",
        "Amount must be a positive number"
      );
    }

    // Validate category structure
    if (
      !category.id ||
      !category.name ||
      !category.icon ||
      typeof category.id !== "string" ||
      typeof category.name !== "string" ||
      typeof category.icon !== "string"
    ) {
      return createResponse(
        res,
        400,
        null,
        "Invalid category format",
        "Category must include id, name, and icon as strings"
      );
    }

    // Create new transaction (date will be automatically set via timestamps)
    const newTransaction = await Transaction.create({
      userId,
      type,
      amount,
      category,
      description: description || undefined,
    });

    return createResponse(
      res,
      201,
      newTransaction,
      null,
      "Transaction created successfully"
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return createResponse(
      res,
      500,
      null,
      "Internal server error",
      "An error occurred while creating the transaction"
    );
  }
};

export const transactionController = {
  addTransaction,
};
