import { useState, useRef, useEffect } from "react";
import { orderService } from "../data/storage";
import { formatCurrency, monthName } from "../utils/format";
import Topbar from "../components/Topbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = [
  "#b5451b",
  "#e8a838",
  "#28a745",
  "#17a2b8",
  "#6f42c1",
  "#dc3545",
];
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth() + 1;
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEARS = [THIS_YEAR - 1, THIS_YEAR];

function aggregate(orders) {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;

  // Top products
  const productMap = {};
  orders.forEach((o) =>
    o.items.forEach((item) => {
      if (!productMap[item.name])
        productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      productMap[item.name].qty += item.qty;
      productMap[item.name].revenue += item.price * item.qty;
    }),
  );
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Category-wise
  const catMap = {};
  orders.forEach((o) =>
    o.items.forEach((item) => {
      // category not stored on order line — we reconstruct from name; fallback 'Other'
      const cat = item.category || "Other";
      if (!catMap[cat]) catMap[cat] = { name: cat, revenue: 0, qty: 0 };
      catMap[cat].revenue += item.price * item.qty;
      catMap[cat].qty += item.qty;
    }),
  );
  const categoryData = Object.values(catMap).sort(
    (a, b) => b.revenue - a.revenue,
  );

  return { totalRevenue, totalOrders, topProducts, categoryData };
}

export default function ReportsPage() {
  const [year, setYear] = useState(THIS_YEAR);
  const [month, setMonth] = useState(THIS_MONTH);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const rows = await orderService.getByMonth(year, month);
        setOrders(rows);
      } catch (error) {
        toast.error(error.message || "Failed to load monthly report");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [year, month]);

  const { totalRevenue, totalOrders, topProducts, categoryData } =
    aggregate(orders);

  const exportPDF = async () => {
    const el = reportRef.current;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`KilnBakers_Report_${year}_${String(month).padStart(2, "0")}.pdf`);
  };

  return (
    <>
      <Topbar title="Monthly Sales Report" />
      <div className="page-body">
        {/* Filters */}
        <div
          className="flex items-center gap-3 mb-4"
          style={{ flexWrap: "wrap" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: ".85rem", fontWeight: 500 }}>
              Month:
            </label>
            <select
              className="form-control"
              style={{ width: 130 }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {new Date(2024, m - 1, 1).toLocaleString("en-IN", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: ".85rem", fontWeight: 500 }}>Year:</label>
            <select
              className="form-control"
              style={{ width: 100 }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={exportPDF}
            disabled={orders.length === 0}
          >
            <Download size={15} /> Export PDF
          </button>
        </div>

        {/* Report body (captured for PDF) */}
        <div ref={reportRef} style={{ background: "#fff", padding: 4 }}>
          {/* Header for PDF */}
          <div
            style={{
              marginBottom: 16,
              borderBottom: "2px solid #e8ddd4",
              paddingBottom: 12,
            }}
          >
            <h2
              style={{ fontFamily: "serif", color: "#b5451b", marginBottom: 2 }}
            >
              🥐 Kiln Bakers
            </h2>
            <p style={{ color: "#7a6f68", fontSize: ".85rem" }}>
              Monthly Sales Report — <strong>{monthName(year, month)}</strong>
            </p>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading report...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found for {monthName(year, month)}.</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Revenue</span>
                  <span className="stat-value">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{totalOrders}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Avg Order Value</span>
                  <span className="stat-value">
                    {totalOrders > 0
                      ? formatCurrency(totalRevenue / totalOrders)
                      : "—"}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Items Sold</span>
                  <span className="stat-value">
                    {topProducts.reduce((s, p) => s + p.qty, 0)}
                  </span>
                </div>
              </div>

              {/* Top-selling products chart */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                  Top-Selling Products by Revenue
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={topProducts}
                      margin={{ top: 5, right: 20, bottom: 60, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                      <XAxis
                        dataKey="name"
                        angle={-35}
                        textAnchor="end"
                        tick={{ fontSize: 11 }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {topProducts.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category-wise breakdown */}
              {categoryData.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-header">Category-wise Sales</div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Units Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryData.map((c) => (
                          <tr key={c.name}>
                            <td>{c.name}</td>
                            <td>{c.qty}</td>
                            <td style={{ fontWeight: 600 }}>
                              {formatCurrency(c.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top products table */}
              <div className="card">
                <div className="card-header">Product Sales Detail</div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={p.name}>
                          <td style={{ color: "var(--text-muted)" }}>
                            {i + 1}
                          </td>
                          <td style={{ fontWeight: 500 }}>{p.name}</td>
                          <td>{p.qty}</td>
                          <td style={{ fontWeight: 600 }}>
                            {formatCurrency(p.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
