// src/models/transaction.model.ts
import { Schema, model, Document, Types } from "mongoose";

// Type for the category subdocument
interface ITransactionCategory {
  id: string;
  name: string;
  icon: string;
}

// Main transaction interface
export interface ITransaction extends Document {
  userId: string;
  type: "income" | "expense";
  amount: number;
  category: ITransactionCategory;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: { type: String, required: true },
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });

TransactionSchema.pre<ITransaction>("save", function (next) {
  if (this.amount <= 0) {
    throw new Error("Amount must be positive");
  }
  next();
});

// Create and export the model
export const Transaction = model<ITransaction>(
  "Transaction",
  TransactionSchema
);
