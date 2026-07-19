

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Product } from "../types";
import { fetchProduct } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Button, Alert, Spinner } from "../components/ui";
import { ArrowLeft, Image as ImageIcon, ShoppingBag } from "lucide-react";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProduct(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-400" role="status">
        <Spinner className="w-6 h-6 mr-2" />
        <span className="text-sm">Loading product…</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <Alert variant="error" className="mb-6">{error || "Product not found."}</Alert>
        <button
          onClick={() => navigate("/")}
          className="text-xs font-semibold text-emerald-700 hover:underline focus:outline-none focus:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="text-xs font-semibold text-neutral-500 hover:text-emerald-700 focus:outline-none focus:underline inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="relative aspect-square w-full bg-neutral-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold text-neutral-400 tracking-wide uppercase">
              {product.petType}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-[10px] font-semibold text-neutral-400 tracking-wide uppercase">
              {product.category}
            </span>
            {product.size && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="text-[10px] font-semibold text-neutral-400 tracking-wide uppercase">
                  {product.size}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl font-display font-bold text-neutral-950 leading-snug mb-3">
            {product.name}
          </h1>

          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="mt-auto space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-sans font-extrabold text-neutral-950">
                ${product.price.toFixed(2)}
              </span>

              <span
                className={`text-sm font-semibold ${
                  product.stock < 20 ? "text-amber-600" : "text-neutral-500"
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <Button
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              fullWidth
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-4 h-4" />
              {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
