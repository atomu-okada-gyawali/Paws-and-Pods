import { useEffect, useState } from "react";
import { Product, ProductFilters, SortOption } from "../types";
import { fetchProducts } from "../lib/api";
import { ProductCard } from "../components/ProductCard";
import { FilterSidebar } from "../components/FilterSidebar";
import { useApp } from "../context/AppContext";
import { Alert, Spinner, Select } from "../components/ui";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  name_asc: "Name: A-Z",
};

export function HomePage() {
  const { addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({ sort: "newest" });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProducts(filters)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.message || "Failed to load product catalog.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-3 bg-white rounded-2xl border border-neutral-100 p-5">
        <FilterSidebar filters={filters} onChange={setFilters} />
      </div>

      <div className="lg:col-span-9 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-neutral-950 tracking-tight">
              Shop All Products
            </h1>
            {!loading && !error && (
              <p className="text-xs text-neutral-500 mt-1">
                {products.length} product{products.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <Select
            size="sm"
            value={filters.sort || "newest"}
            onChange={(e) =>
              setFilters({ ...filters, sort: e.target.value as SortOption })
            }
            className="py-2 bg-white border-neutral-200 text-neutral-700"
            aria-label="Sort products"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {loading && (
          <div
            className="flex items-center justify-center py-16 text-neutral-400"
            role="status"
          >
            <Spinner className="w-6 h-6 mr-2" />
            <span className="text-sm">Loading products…</span>
          </div>
        )}

        {error && !loading && <Alert variant="error">{error}</Alert>}

        {!loading && !error && products.length === 0 && (
          <div className="p-6 text-center text-sm text-neutral-500 bg-white rounded-2xl border border-neutral-100">
            No products match your filters.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
