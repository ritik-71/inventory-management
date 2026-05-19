"use client";

interface FilterPanelProps {
  categories: string[];
  suppliers: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSupplier: string;
  setSelectedSupplier: (sup: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
}

export default function FilterPanel({
  categories, suppliers, 
  selectedCategory, setSelectedCategory, 
  selectedSupplier, setSelectedSupplier,
  selectedStatus, setSelectedStatus,
  sortBy, setSortBy,
  startDate, setStartDate,
  endDate, setEndDate
}: FilterPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label className="label">Category</label>
        <select className="input" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      
      <div>
        <label className="label">Supplier</label>
        <select className="input" value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
          <option value="">All Suppliers</option>
          {suppliers.map(sup => <option key={sup} value={sup}>{sup}</option>)}
        </select>
      </div>

      <div>
        <label className="label">Status</label>
        <select className="input" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </div>
      
      <div>
        <label className="label">Date Range</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
          <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date" />
          <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date" />
        </div>
      </div>

      <div>
        <label className="label">Sort By</label>
        <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="">None</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="qty_asc">Quantity: Low to High</option>
          <option value="qty_desc">Quantity: High to Low</option>
        </select>
      </div>

      <button className="btn btn-outline" style={{ marginTop: 'auto' }} onClick={() => {
        setSelectedCategory("");
        setSelectedSupplier("");
        setSelectedStatus("");
        setStartDate("");
        setEndDate("");
        setSortBy("");
      }}>
        Reset Filters
      </button>
    </div>
  );
}
