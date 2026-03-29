import { QRCodeCanvas } from "qrcode.react";
import { formatCurrency } from "../utils/format";
import { Printer, X } from "lucide-react";

export default function QRModal({ order, settings, onClose }) {
  // Build UPI deep-link so any UPI app can scan and auto-fill amount
  const upiString = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.upiName)}&am=${order.total}&tn=Order%20${order.billNo}&cu=INR`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 380 }}
      >
        <div className="modal-header">
          <h3>Pay Now — UPI QR</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">
          <div className="qr-wrapper">
            <QRCodeCanvas
              value={upiString}
              size={220}
              bgColor="#ffffff"
              fgColor="#b5451b"
              level="H"
              includeMargin
            />
            <div className="qr-amount">{formatCurrency(order.total)}</div>
            <div className="qr-upi-label">
              <strong>{settings.upiName}</strong>
              <br />
              UPI ID: <code>{settings.upiId}</code>
            </div>
            <p className="qr-instructions">
              Scan with any UPI app (PhonePe, GPay, Paytm, etc.).
              <br />
              Bill No: <strong>{order.billNo}</strong>
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            <Printer size={14} /> Done &amp; Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}
