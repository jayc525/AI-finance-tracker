import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function BarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-header"><h3>Monthly Spending</h3></div>
        <div className="empty-state"><p>No data to display</p></div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    total: item.total,
  }));

  return (
    <div className="card">
      <div className="card-header"><h3>Monthly Spending</h3></div>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBar data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
            }}
          />
          <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;
