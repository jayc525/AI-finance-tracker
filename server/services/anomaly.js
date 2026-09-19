const Expense = require("../models/Expense");

// detect anomalies using the IQR (Interquartile Range) method
async function detectAnomalies(userId) {
  const categories = await Expense.distinct("category", { userId });

  for (const category of categories) {
    // get all amounts for this category
    const expenses = await Expense.find({ userId, category })
      .select("amount")
      .sort({ amount: 1 });

    if (expenses.length < 4) {
      // not enough data to detect anomalies
      continue;
    }

    const amounts = expenses.map((e) => e.amount);

    // calculate Q1 (25th percentile) and Q3 (75th percentile)
    const q1Index = Math.floor(amounts.length * 0.25);
    const q3Index = Math.floor(amounts.length * 0.75);
    const q1 = amounts[q1Index];
    const q3 = amounts[q3Index];
    const iqr = q3 - q1;

    // upper fence = Q3 + 1.5 * IQR
    const upperFence = q3 + 1.5 * iqr;

    // mark expenses above the upper fence as anomalies
    await Expense.updateMany(
      { userId, category, amount: { $gt: upperFence } },
      {
        $set: {
          isAnomaly: true,
          anomalyScore: upperFence > 0 ? 1 : 0,
        },
      }
    );

    // un-mark expenses that are now within range
    await Expense.updateMany(
      { userId, category, amount: { $lte: upperFence } },
      { $set: { isAnomaly: false, anomalyScore: 0 } }
    );
  }
}

// get anomalous expenses for a user
async function getAnomalies(userId) {
  return Expense.find({ userId, isAnomaly: true })
    .sort({ date: -1 })
    .limit(10);
}

module.exports = { detectAnomalies, getAnomalies };
