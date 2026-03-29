import { useEffect, useState } from "react";
import { orderService } from "../data/storage";
import { formatCurrency, formatDateTime } from "../utils/format";
import Topbar from "../components/Topbar";
import PrintableBill from "../components/PrintableBill";
import { settingsService } from "../data/storage";
import { Printer } from "lucide-react";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderRows, settingsRow] = await Promise.all([
          orderService.getAll(),
          settingsService.get(),
        ]);
        setOrders(orderRows);
        setSettings(settingsRow);
      } catch (error) {
        toast.error(error.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <Topbar title="Order History" />
      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <span>All Orders ({orders.length})</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date &amp; Time</th>
                  <th>Ordered By</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="empty-state">
                      Loading orders...
                    </td>
                  </tr>
                )}
                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="empty-state">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>{o.billNo}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {formatDateTime(o.createdAt)}
                      </td>
                      <td>{o.orderedByEmail || "—"}</td>
                      <td>
                        {o.items.length} item{o.items.length > 1 ? "s" : ""}
                      </td>
                      <td>{formatCurrency(o.subtotal)}</td>
                      <td style={{ fontWeight: 600 }}>
                        {formatCurrency(o.total)}
                      </td>
                      <td>{o.paymentMethod}</td>
                      <td>
                        <span
                          className={`badge ${o.paymentStatus === "paid" ? "badge-paid" : "badge-pending"}`}
                        >
                          {o.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setViewOrder(o)}
                          title="View / Print"
                        >
                          <Printer size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {viewOrder && settings && (
          <PrintableBill
            order={viewOrder}
            settings={settings}
            onClose={() => setViewOrder(null)}
          />
        )}
      </div>
    </>
  );
}
