const CATEGORIES = [
  "Food", "Groceries", "Transport", "Shopping", "Entertainment",
  "Bills", "Health", "Education", "Travel", "Other",
];

function FilterBar({ startDate, endDate, category, onStartDateChange, onEndDateChange, onCategoryChange }) {
  const clearFilters = () => {
    onStartDateChange("");
    onEndDateChange("");
    onCategoryChange("");
  };

  const hasFilters = startDate || endDate || category;

  return (
    <div className="filter-bar">
      <div className="form-group">
        <label>From</label>
        <input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} />
      </div>
      <div className="form-group">
        <label>To</label>
        <input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Category</label>
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {hasFilters && (
        <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
      )}
    </div>
  );
}

export default FilterBar;
