

import { useEffect, useState } from "react";
import { Product } from "../../types";
import { fetchProducts } from "../../lib/api";
import { adminDeleteProduct } from "../../lib/adminApi";
import { useApp } from "../../context/AppContext";
import { ProductFormModal } from "./ProductFormModal";
import { Button, IconButton, Alert, Spinner } from "../../components/ui";
import { Pencil, Plus, Trash2 } from "lucide-react";

export function AdminProductsPage() {
  const { accessToken } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message || "Failed to load products."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingProduct(null);
    setIsFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setIsFormOpen(true);
  }

  function handleSaved() {
    setIsFormOpen(false);
    setEditingProduct(null);
    load();
  }

  async function handleDelete(product: Product) {
    if (!accessToken) return;
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeletingId(product.id);
    try {
      await adminDeleteProduct(accessToken, product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-neutral-500">{products.length} product{products.length === 1 ? "" : "s"}</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-neutral-400" role="status">
          <Spinner className="w-6 h-6 mr-2" />
          <span className="text-sm">Loading products…</span>
        </div>
      )}

      {error && !loading && <Alert variant="error">{error}</Alert>}

      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Pet</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-neutral-900">{product.name}</div>
                    <div className="text-xs text-neutral-400">{product.sku}</div>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{product.petType}</td>
                  <td className="px-5 py-3 text-neutral-600">{product.category}</td>
                  <td className="px-5 py-3 text-neutral-900 font-semibold">${product.price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-neutral-600">{product.stock}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <IconButton label={`Edit ${product.name}`} onClick={() => openEdit(product)}>
                        <Pencil className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        label={`Delete ${product.name}`}
                        variant="danger"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? <Spinner /> : <Trash2 className="w-4 h-4" />}
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
