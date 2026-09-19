const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Food",
      "Groceries",
      "Transport",
      "Shopping",
      "Entertainment",
      "Bills",
      "Health",
      "Education",
      "Travel",
      "Other",
    ],
  },
  merchant: {
    type: String,
    default: "",
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  rawText: {
    type: String,
    default: "",
  },
  isAnomaly: {
    type: Boolean,
    default: false,
  },
  anomalyScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// index for faster queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
