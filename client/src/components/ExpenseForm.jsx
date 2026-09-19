import { useState } from "react";
import API from "../api";

const CATEGORIES = [
  "Food", "Groceries", "Transport", "Shopping", "Entertainment",
  "Bills", "Health", "Education", "Travel", "Other",
];

function ExpenseForm({ onExpenseAdded }) {
  const [mode, setMode] = useState("nl");
  const [nlText, setNlText] = useState("");
  const [parsedResult, setParsedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleNlSubmit = async (e) => {
    e.preventDefault();
    if (!nlText.trim()) return;

    setLoading(true);
    setError("");
    setParsedResult(null);

    try {
      const res = await API.post("/expenses/parse", { text: nlText });
      setParsedResult(res.data);
      setNlText("");
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to parse. Try entering manually.";
      setError(msg);
      setMode("manual");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !date) return;

    setLoading(true);
    setError("");

    try {
      await API.post("/expenses", {
        amount: parseFloat(amount),
        category,
        merchant,
        date,
      });
      setAmount("");
      setCategory("Food");
      setMerchant("");
      setDate(new Date().toISOString().split("T")[0]);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card expense-form-section">
      <div className="card-header">
        <h3>Add Expense</h3>
        <button
          className="manual-form-toggle"
          onClick={() => {
            setMode(mode === "nl" ? "manual" : "nl");
            setError("");
            setParsedResult(null);
          }}
        >
          {mode === "nl" ? "Enter manually" : "Use AI input"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {mode === "nl" ? (
        <form onSubmit={handleNlSubmit}>
          <div className="form-group nl-input-wrapper">
            <textarea
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              placeholder='Try: "spent 200 on coffee at Starbucks yesterday"'
              disabled={loading}
            />
            <p className="hint">
              Describe your expense in plain English. AI will extract the details.
            </p>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !nlText.trim()}>
            {loading ? <span className="spinner"></span> : "Parse & Save"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit}>
          <div className="manual-form">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                required
                min="0"
                step="any"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Merchant</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Swiggy, DMart, etc."
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group full-width">
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="spinner"></span> : "Add Expense"}
              </button>
            </div>
          </div>
        </form>
      )}

      {parsedResult && (
        <div className="parsed-preview">
          <h4>✓ Expense saved!</h4>
          <div className="field">
            <span>Amount</span>
            <span>₹{parsedResult.amount}</span>
          </div>
          <div className="field">
            <span>Category</span>
            <span>{parsedResult.category}</span>
          </div>
          <div className="field">
            <span>Merchant</span>
            <span>{parsedResult.merchant || "—"}</span>
          </div>
          <div className="field">
            <span>Date</span>
            <span>{new Date(parsedResult.date).toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseForm;
