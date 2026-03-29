import { NavLink } from "react-router-dom";
import {
  ShoppingBag,
  LayoutGrid,
  ClipboardList,
  BarChart2,
  Settings,
} from "lucide-react";

const links = [
  { to: "/", label: "Menu / Billing", Icon: ShoppingBag },
  { to: "/products", label: "Product Manager", Icon: LayoutGrid },
  { to: "/orders", label: "Order History", Icon: ClipboardList },
  { to: "/reports", label: "Monthly Reports", Icon: BarChart2 },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>🥐 Kiln Bakers</h1>
        <span>Bakery POS System</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, Icon }) => (
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
    </aside>
  );
}
