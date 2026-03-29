import { NavLink, useNavigate } from "react-router-dom";
import {
  Lock,
  LogOut,
  ShoppingBag,
  LayoutGrid,
  ClipboardList,
  BarChart2,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Menu / Billing", Icon: ShoppingBag },
  { to: "/products", label: "Product Manager", Icon: LayoutGrid },
  { to: "/orders", label: "Order History", Icon: ClipboardList },
  { to: "/reports", label: "Monthly Reports", Icon: BarChart2 },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const visibleLinks = isAdmin ? links : links.filter((l) => l.to === "/");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🥐 Kiln Bakers</h1>
        <span>Bakery POS System</span>
      </div>
      <nav className="sidebar-nav">
        {visibleLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="sidebar-user-chip">
              <strong>{isAdmin ? "Admin" : "Guest"}</strong>
              <span>{user.email}</span>
            </div>
            <button className="btn btn-outline" onClick={handleSignOut}>
              <LogOut size={15} /> Sign Out
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            <Lock size={15} /> Admin Login
          </button>
        )}
      </div>
    </aside>
  );
}
