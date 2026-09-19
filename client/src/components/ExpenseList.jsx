import { useState } from "react";
import { FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import API from "../api";

const CATEGORIES = [
  "Food", "Groceries", "Transport", "Shopping", "Entertainment",
  "Bills", "Health", "Education", "Travel", "Other",
];

function ExpenseList({ expenses, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setEditData({
      amount: expense.amount,
      category: expense.category,
      merchant: expense.merchant || "",
      date: new Date(expense.date).toISOString().split("T")[0],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      await API.put(`/expenses/${id}`, {
        ...editData,
        amount: parseFloat(editData.amount),
      });
      setEditingId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/expenses/${id}`);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  if (!expenses || expenses.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="icon">📝</div>
          <h3>No expenses yet</h3>
          <p>Add your first expense using the form above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Recent Expenses</h3>
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          {expenses.length} items
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                {editingId === expense._id ? (
                  <>
                    <td>
                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem" }}
                      />
                    </td>
                    <td>
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem" }}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editData.merchant}
                        onChange={(e) => setEditData({ ...editData, merchant: e.target.value })}
                        style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem", width: "100px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editData.amount}
                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                        style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem", width: "80px" }}
                      />
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => saveEdit(expense._id)} title="Save"><FiCheck /></button>
                        <button onClick={cancelEdit} title="Cancel"><FiX /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{new Date(expense.date).toLocaleDateString("en-IN")}</td>
                    <td>
                      <span className="category-badge">{expense.category}</span>
                      {expense.isAnomaly && (
                        <span className="anomaly-badge" title="Unusually high">⚠️ High</span>
                      )}
                    </td>
                    <td>{expense.merchant || "—"}</td>
                    <td className="amount">₹{expense.amount.toLocaleString("en-IN")}</td>
                    <td>
                      <div className="actions-cell">
                        <button onClick={() => startEdit(expense)} title="Edit"><FiEdit2 /></button>
                        <button className="delete" onClick={() => deleteExpense(expense._id)} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseList;
