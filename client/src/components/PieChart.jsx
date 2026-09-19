import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#6c63ff", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6",
  "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#64748b",
];

function PieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-header"><h3>Category Breakdown</h3></div>
        <div className="empty-state"><p>No data to display</p></div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header"><h3>Category Breakdown</h3></div>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPie>
          <Pie
            data={data}
            dataKey="total"
            nameKey="_id"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
            labelLine={true}
          >
            {data.map((entry, index) => (
              <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-primary)",
            }}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChart;
