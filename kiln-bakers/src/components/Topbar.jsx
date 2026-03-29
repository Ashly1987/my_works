import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function Topbar({ title }) {
  const { cart } = useCart();
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-meta">
        {itemCount > 0 && (
          <span className="cart-chip">
            <ShoppingCart size={13} /> {itemCount} item
            {itemCount > 1 ? "s" : ""} in cart
          </span>
        )}
        <span style={{ fontSize: ".82rem", color: "var(--text-muted)" }}>
          {new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </header>
  );
}
