const express = require("express");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const { createExpenseSchema, parsedExpenseSchema } = require("../validators/expense");
const { parseExpense } = require("../services/gemini");
const { detectAnomalies } = require("../services/anomaly");

const router = express.Router();

// all routes require auth
router.use(auth);

// GET /api/expenses - list user's expenses
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    // build filter
    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (category) {
      filter.category = category;
    }

    const expenses = await Expense.find(filter).sort({ date: -1 }).limit(100);

    res.json(expenses);
  } catch (err) {
    console.error("Get expenses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/expenses - create expense manually
router.post("/", async (req, res) => {
  try {
    // validate with zod
    const result = createExpenseSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    const expense = new Expense({
      ...result.data,
      date: new Date(result.data.date),
      userId: req.userId,
    });

    await expense.save();

    // run anomaly detection in background (don't wait for it)
    detectAnomalies(req.userId).catch((err) =>
      console.error("Anomaly detection error:", err)
    );

    res.status(201).json(expense);
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/expenses/parse - parse expense from natural language
router.post("/parse", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    // call gemini to parse the text
    const parsed = await parseExpense(text);

    if (!parsed) {
      return res.status(422).json({
        message: "Couldn't understand that. Please try again or enter manually.",
      });
    }

    // validate the parsed output with zod
    const result = parsedExpenseSchema.safeParse(parsed);
    if (!result.success) {
      return res.status(422).json({
        message: "Parsed data is invalid. Please enter manually.",
      });
    }

    // save the expense
    const expense = new Expense({
      ...result.data,
      date: new Date(result.data.date),
      userId: req.userId,
      rawText: text,
    });

    await expense.save();

    // run anomaly detection in background
    detectAnomalies(req.userId).catch((err) =>
      console.error("Anomaly detection error:", err)
    );

    res.status(201).json(expense);
  } catch (err) {
    console.error("Parse expense error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/expenses/:id - update expense
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // make sure user owns this expense
    if (expense.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // validate the update data
    const result = createExpenseSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    expense.amount = result.data.amount;
    expense.category = result.data.category;
    expense.merchant = result.data.merchant || "";
    expense.date = new Date(result.data.date);

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error("Update expense error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/expenses/:id - delete expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Delete expense error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
