import { createElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, ClipboardList, BarChart2, Settings } from "lucide-react";
import Topbar from "../components/Topbar";
import { orderService } from "../data/storage";
import { formatCurrency } from "../utils/format";
import toast from "react-hot-toast";

function isToday(isoDate) {
  const now = new Date();
  const date = new Date(isoDate);
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

const adminCards = [
  { to: "/products", label: "Manage Products", icon: Boxes },
  { to: "/orders", label: "View Orders", icon: ClipboardList },
  { to: "/reports", label: "Monthly Reports", icon: BarChart2 },
  { to: "/settings", label: "Store Settings", icon: Settings },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const rows = await orderService.getAll();
        const todayRows = rows.filter((o) => isToday(o.createdAt));
        setTodayOrders(todayRows.length);
        setTodayRevenue(todayRows.reduce((sum, o) => sum + o.total, 0));
      } catch (error) {
        toast.error(error.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <>
      <Topbar title="Admin Dashboard" />
      <div className="page-body">
        <div
          className="stats-grid"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
          <div className="stat-card">
            <span className="stat-label">Today's Orders</span>
            <span className="stat-value">{loading ? "..." : todayOrders}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Today's Revenue</span>
            <span className="stat-value">
              {loading ? "..." : formatCurrency(todayRevenue)}
            </span>
          </div>
        </div>

        <div className="admin-links-grid">
          {adminCards.map(({ to, label, icon: CardIcon }) => (
            <Link key={to} to={to} className="admin-link-card">
              {createElement(CardIcon, { size: 20 })}
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
