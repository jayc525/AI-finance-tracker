const { z } = require("zod");

const CATEGORIES = [
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
];

// schema for manually creating an expense
const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  merchant: z.string().optional().default(""),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

// schema for validating gemini-parsed output
const parsedExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(CATEGORIES).catch("Other"),
  merchant: z.string().optional().default(""),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

module.exports = { createExpenseSchema, parsedExpenseSchema, CATEGORIES };
