import { useRef } from "react";
import { formatCurrency, formatDateTime } from "../utils/format";
import { Printer, X } from "lucide-react";

export default function PrintableBill({ order, settings, onClose }) {
  const billRef = useRef();

  const handlePrint = () => {
    const content = billRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=700");
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Bill – ${order.billNo}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;max-width:320px;margin:auto;color:#222}
        h1{font-size:1.2rem;text-align:center;margin-bottom:2px}
        .center{text-align:center}
        .small{font-size:.78rem;color:#666}
        hr{border:none;border-top:1px dashed #aaa;margin:8px 0}
        table{width:100%;border-collapse:collapse;font-size:.82rem}
        td{padding:3px 2px;vertical-align:top}
        .right{text-align:right}
        .bold{font-weight:700}
        .total-row td{border-top:2px solid #222;font-weight:700;font-size:.95rem;padding-top:6px}
        footer{text-align:center;font-size:.7rem;color:#aaa;margin-top:16px}
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 420 }}
      >
        <div className="modal-header">
          <h3>Invoice — {order.billNo}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: 12 }}>
          {/* Bill preview */}
          <div
            ref={billRef}
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: ".82rem",
              color: "#222",
            }}
          >
            <h1
              style={{
                textAlign: "center",
                marginBottom: 2,
                fontSize: "1.15rem",
              }}
            >
              {settings.storeName}
            </h1>
            <p
              style={{
                textAlign: "center",
                fontSize: ".75rem",
                color: "#666",
                marginBottom: 4,
              }}
            >
              {settings.storeAddress}
              <br />
              {settings.storePhone}
            </p>
            <hr
              style={{
                border: "none",
                borderTop: "1px dashed #aaa",
                margin: "6px 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: ".78rem",
                color: "#666",
              }}
            >
              <span>
                Bill No: <strong>{order.billNo}</strong>
              </span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <hr
              style={{
                border: "none",
                borderTop: "1px dashed #aaa",
                margin: "6px 0",
              }}
            />

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: ".82rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #ccc" }}>
                  <td>
                    <strong>Item</strong>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <strong>Qty</strong>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <strong>Rate</strong>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <strong>Amt</strong>
                  </td>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ paddingTop: 4 }}>{item.name}</td>
                    <td style={{ textAlign: "center", paddingTop: 4 }}>
                      {item.qty}
                    </td>
                    <td style={{ textAlign: "right", paddingTop: 4 }}>
                      {formatCurrency(item.price)}
                    </td>
                    <td style={{ textAlign: "right", paddingTop: 4 }}>
                      {formatCurrency(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr
              style={{
                border: "none",
                borderTop: "1px dashed #aaa",
                margin: "8px 0",
              }}
            />
            <table style={{ width: "100%", fontSize: ".82rem" }}>
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(order.subtotal)}
                  </td>
                </tr>
                {order.discountAmt > 0 && (
                  <tr style={{ color: "green" }}>
                    <td>Discount</td>
                    <td style={{ textAlign: "right" }}>
                      −{formatCurrency(order.discountAmt)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td>GST ({order.taxRate}%)</td>
                  <td style={{ textAlign: "right" }}>
                    {formatCurrency(order.taxAmt)}
                  </td>
                </tr>
                <tr style={{ borderTop: "2px solid #222" }}>
                  <td
                    style={{
                      paddingTop: 6,
                      fontWeight: 700,
                      fontSize: ".9rem",
                    }}
                  >
                    TOTAL
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      paddingTop: 6,
                      fontWeight: 700,
                      fontSize: ".9rem",
                    }}
                  >
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              </tbody>
            </table>

            <hr
              style={{
                border: "none",
                borderTop: "1px dashed #aaa",
                margin: "8px 0",
              }}
            />
            <p
              style={{
                textAlign: "center",
                fontSize: ".75rem",
                color: "#777",
                marginTop: 8,
              }}
            >
              Payment: <strong>{order.paymentMethod}</strong> —{" "}
              <strong
                style={{
                  color: order.paymentStatus === "paid" ? "green" : "#c67f00",
                }}
              >
                {order.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
              </strong>
            </p>
            <p
              style={{
                textAlign: "center",
                fontSize: ".7rem",
                color: "#aaa",
                marginTop: 10,
              }}
            >
              Thank you for visiting {settings.storeName}!<br />
              Come back soon. 🧁
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={14} /> Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}
