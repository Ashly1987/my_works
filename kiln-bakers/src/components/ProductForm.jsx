import { useState } from "react";
import { CATEGORIES } from "../data/seedProducts";

const EMPTY = {
  name: "",
  category: CATEGORIES[0],
  price: "",
  description: "",
  image: "",
  available: true,
};

function validate(data) {
  const errs = {};
  if (!data.name.trim()) errs.name = "Name is required";
  if (!data.price || isNaN(data.price) || Number(data.price) <= 0)
    errs.price = "Enter a valid price";
  return errs;
}

export default function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          category: product.category,
          price: String(product.price),
          description: product.description || "",
          image: product.image || "",
          available: product.available,
        }
      : { ...EMPTY },
  );
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave({ ...form, price: Number(form.price) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <div className="modal-header">
          <h3>{product ? "Edit Product" : "Add New Product"}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                className={`form-control${errors.name ? " error" : ""}`}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Plum Cake"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  className={`form-control${errors.price ? " error" : ""}`}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="e.g. 450"
                  type="number"
                  min="0"
                />
                {errors.price && (
                  <span className="form-error">{errors.price}</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short description…"
                rows={2}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                className="form-control"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://..."
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  style={{
                    marginTop: 6,
                    height: 80,
                    borderRadius: 6,
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => set("available", e.target.checked)}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Available for sale
                </span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
