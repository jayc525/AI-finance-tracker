function AnomalyAlert({ anomalies }) {
  if (!anomalies || anomalies.length === 0) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      {anomalies.slice(0, 3).map((expense) => (
        <div key={expense._id} className="anomaly-alert">
          <span className="icon">⚠️</span>
          <div className="content">
            <h4>Unusual {expense.category} expense</h4>
            <p>
              ₹{expense.amount.toLocaleString("en-IN")} at{" "}
              {expense.merchant || "unknown"} on{" "}
              {new Date(expense.date).toLocaleDateString("en-IN")} is higher
              than your usual spending in this category.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AnomalyAlert;
