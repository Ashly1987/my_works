import { useEffect, useState } from "react";
import { productService } from "../data/storage";
import { CATEGORIES } from "../data/seedProducts";
import Topbar from "../components/Topbar";
import ProductForm from "../components/ProductForm";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "../utils/format";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const reload = async () => {
    try {
      const rows = await productService.getAll();
      setProducts(rows);
    } catch (error) {
      toast.error(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = catFilter === "All" || p.category === catFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSave = async (data) => {
    try {
      if (editProduct) {
        await productService.update(editProduct.id, data);
        toast.success("Product updated");
      } else {
        await productService.add(data);
        toast.success("Product added");
      }
      await reload();
      setShowForm(false);
      setEditProduct(null);
    } catch (error) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      toast.success("Product deleted");
      await reload();
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setShowForm(true);
  };

  return (
    <>
      <Topbar title="Product Manager" />
      <div className="page-body">
        {/* Toolbar */}
        <div
          className="flex items-center justify-between mb-4 gap-2"
          style={{ flexWrap: "wrap" }}
        >
          <div
            className="flex items-center gap-2"
            style={{ flexWrap: "wrap", flex: 1 }}
          >
            <div className="search-bar" style={{ minWidth: 200 }}>
              <Search className="search-icon" size={15} />
              <input
                className="form-control"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="chip-group" style={{ marginBottom: 0 }}>
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
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditProduct(null);
              setShowForm(true);
            }}
          >
            <Plus size={15} /> Add Product
          </button>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Loading products...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img
                          className="img-thumb"
                          src={p.image}
                          alt={p.name}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/44x44?text=🎂";
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>
                        <span
                          style={{
                            fontSize: ".8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {p.category}
                        </span>
                      </td>
                      <td>{formatCurrency(p.price)}</td>
                      <td>
                        <span
                          className={`badge ${p.available ? "badge-available" : "badge-unavailable"}`}
                        >
                          {p.available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(p)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm text-danger"
                            onClick={() => setConfirmDelete(p)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            product={editProduct}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditProduct(null);
            }}
          />
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Delete Product</h3>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setConfirmDelete(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{confirmDelete.name}</strong>? This cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-outline"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(confirmDelete.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
