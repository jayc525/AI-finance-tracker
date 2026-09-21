const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const { getAnomalies } = require("../services/anomaly");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

const router = express.Router();

router.use(auth);

// GET /api/dashboard/category-totals
router.get("/category-totals", cacheMiddleware(300), async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    // build match stage
    const match = { userId: new mongoose.Types.ObjectId(req.userId) };

    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    if (category) {
      match.category = category;
    }

    const results = await Expense.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json(results);
  } catch (err) {
    console.error("Category totals error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dashboard/monthly-trends
router.get("/monthly-trends", cacheMiddleware(300), async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const match = { userId: new mongoose.Types.ObjectId(req.userId) };

    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    if (category) {
      match.category = category;
    }

    const results = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(results);
  } catch (err) {
    console.error("Monthly trends error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dashboard/anomalies
router.get("/anomalies", cacheMiddleware(300), async (req, res) => {
  try {
    const anomalies = await getAnomalies(req.userId);
    res.json(anomalies);
  } catch (err) {
    console.error("Anomalies error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
