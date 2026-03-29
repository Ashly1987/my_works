// ─── Currency ────────────────────────────────────────────────────────────────
export const formatCurrency = amount =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

// ─── Date / time ─────────────────────────────────────────────────────────────
export const formatDate = isoString =>
  new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = isoString =>
  new Date(isoString).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const monthName = (year, month) =>
  new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

// ─── Bill computation ────────────────────────────────────────────────────────
export const computeBill = (cartItems, taxRate, discount = 0) => {
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmt = Math.min(discount, subtotal);
  const taxable = subtotal - discountAmt;
  const taxAmt = parseFloat(((taxable * taxRate) / 100).toFixed(2));
  const total = parseFloat((taxable + taxAmt).toFixed(2));
  return { subtotal, discountAmt, taxAmt, total };
};
