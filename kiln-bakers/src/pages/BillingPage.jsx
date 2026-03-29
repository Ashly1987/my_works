import { useEffect, useState } from "react";
import { productService, orderService, settingsService } from "../data/storage";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../data/seedProducts";
import { formatCurrency, computeBill } from "../utils/format";
import Topbar from "../components/Topbar";
import QRModal from "../components/QRModal";
import PrintableBill from "../components/PrintableBill";
import AuthModal from "../components/AuthModal";
import { Minus, Plus, X, Printer, QrCode, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function BillingPage() {
  const [products, setProducts] = useState([]);
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState({
    storeName: "Kiln Bakers",
    storeAddress: "",
    storePhone: "",
    taxRate: 5,
    upiId: "",
    upiName: "",
  });
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showPrint, setShowPrint] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingCheckoutAction, setPendingCheckoutAction] = useState(null);

  const { cart, addToCart, removeFromCart, updateQty, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productRows, settingsRow] = await Promise.all([
          productService.getAll(),
          settingsService.get(),
        ]);
        setProducts(productRows);
        setSettings(settingsRow);
      } catch (error) {
        toast.error(error.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const available = products.filter((p) => p.available);
  const filtered = available.filter((p) => {
    const matchCat = catFilter === "All" || p.category === catFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const { subtotal, discountAmt, taxAmt, total } = computeBill(
    cart,
    settings.taxRate,
    Number(discount) || 0,
  );

  const handleCheckout = async (payNow = false) => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!isAuthenticated) {
      setPendingCheckoutAction(payNow);
      setShowAuthModal(true);
      return;
    }

    try {
      const order = await orderService.add({
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          qty: i.qty,
        })),
        subtotal,
        discountAmt,
        taxAmt,
        total,
        taxRate: settings.taxRate,
        paymentStatus: payNow ? "pending" : "paid",
        paymentMethod: payNow ? "UPI" : "Cash",
      });
      setLastOrder(order);
      clearCart();
      setDiscount(0);
      toast.success(`Order ${order.billNo} created!`);
      if (payNow) setShowQR(true);
      else setShowPrint(true);
    } catch (error) {
      toast.error(error.message || "Failed to create order");
    }
  };

  return (
    <>
      <Topbar title="Menu & Billing" />
      <div className="page-body">
        <div className="billing-layout">
          {/* ── Menu panel ─────────────────────── */}
          <div>
            {/* Search + chips */}
            <div style={{ marginBottom: 12 }}>
              <div className="search-bar" style={{ marginBottom: 10 }}>
                <svg
                  className="search-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  className="form-control"
                  placeholder="Search menu…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="chip-group">
                {["All", ...CATEGORIES].map((c) => (
                  <button
                    key={c}
                    className={`chip${catFilter === c ? " active" : ""}`}
                    onClick={() => setCatFilter(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Loading menu...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={40} />
                <p>No items found</p>
              </div>
            ) : (
              <div className="product-grid">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="product-card"
                    onClick={() => {
                      addToCart(p);
                      toast.success(`${p.name} added`);
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?w=400";
                      }}
                    />
                    <div className="product-card-body">
                      <div className="product-card-name">{p.name}</div>
                      <div className="product-card-cat">{p.category}</div>
                      <div className="product-card-price">
                        {formatCurrency(p.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Cart panel ─────────────────────── */}
          <div className="cart-panel">
            <div className="card-header">
              <span>
                <ShoppingCart
                  size={16}
                  style={{ marginRight: 6, verticalAlign: "middle" }}
                />
                Cart
              </span>
              {cart.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm text-danger"
                  onClick={clearCart}
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 12px" }}>
                  <ShoppingCart size={28} style={{ opacity: 0.3 }} />
                  <p style={{ marginTop: 8, fontSize: ".85rem" }}>
                    Click products to add
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: ".85rem",
                        color: "var(--text-muted)",
                        minWidth: 64,
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(item.price * item.qty)}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 4 }}
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bill summary */}
            <div className="bill-summary">
              {cart.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: ".78rem",
                      color: "var(--text-muted)",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={subtotal}
                    className="form-control"
                    style={{ padding: "5px 10px", fontSize: ".85rem" }}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
              <div className="bill-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="bill-row" style={{ color: "var(--success)" }}>
                  <span>Discount</span>
                  <span>−{formatCurrency(discountAmt)}</span>
                </div>
              )}
              <div className="bill-row">
                <span>GST ({settings.taxRate}%)</span>
                <span>{formatCurrency(taxAmt)}</span>
              </div>
              <div className="bill-row total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout(true)}
                >
                  <QrCode size={16} /> Pay Now (QR)
                </button>
                <button
                  className="btn btn-outline"
                  style={{ width: "100%", justifyContent: "center" }}
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout(false)}
                >
                  <Printer size={16} /> Cash &amp; Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Payment modal */}
        {showQR && lastOrder && (
          <QRModal
            order={lastOrder}
            settings={settings}
            onClose={() => {
              setShowQR(false);
              setShowPrint(true);
            }}
          />
        )}

        {/* Print bill */}
        {showPrint && lastOrder && (
          <PrintableBill
            order={lastOrder}
            settings={settings}
            onClose={() => setShowPrint(false)}
          />
        )}

        {showAuthModal && (
          <AuthModal
            onClose={() => {
              setShowAuthModal(false);
              setPendingCheckoutAction(null);
            }}
            onSuccess={() => {
              if (pendingCheckoutAction !== null) {
                handleCheckout(pendingCheckoutAction);
              }
              setPendingCheckoutAction(null);
            }}
          />
        )}
      </div>
    </>
  );
}
