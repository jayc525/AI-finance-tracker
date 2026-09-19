import { useState, useEffect, useCallback } from "react";
import API from "../api";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import FilterBar from "../components/FilterBar";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import AnomalyAlert from "../components/AnomalyAlert";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (category) params.category = category;

      const [expensesRes, categoryRes, trendsRes, anomalyRes] = await Promise.all([
        API.get("/expenses", { params }),
        API.get("/dashboard/category-totals", { params }),
        API.get("/dashboard/monthly-trends", { params }),
        API.get("/dashboard/anomalies").catch(() => ({ data: [] })),
      ]);

      setExpenses(expensesRes.data);
      setCategoryTotals(categoryRes.data);
      setMonthlyTrends(trendsRes.data);
      setAnomalies(anomalyRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, category]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseCount = expenses.length;
  const avgExpense = expenseCount > 0 ? totalSpend / expenseCount : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Track and manage your expenses</p>
      </div>

      {anomalies.length > 0 && <AnomalyAlert anomalies={anomalies} />}

      <ExpenseForm onExpenseAdded={fetchData} />

      <FilterBar
        startDate={startDate}
        endDate={endDate}
        category={category}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onCategoryChange={setCategory}
      />

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">₹{totalSpend.toLocaleString("en-IN")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value">{expenseCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average</div>
          <div className="stat-value">₹{Math.round(avgExpense).toLocaleString("en-IN")}</div>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="charts-grid">
            <PieChart data={categoryTotals} />
            <BarChart data={monthlyTrends} />
          </div>
          <ExpenseList expenses={expenses} onUpdate={fetchData} />
        </>
      )}
    </div>
  );
}

export default Dashboard;
