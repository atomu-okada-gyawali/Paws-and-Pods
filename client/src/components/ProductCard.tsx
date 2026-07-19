

import { Link } from "react-router-dom";
import { Product } from "../types";
import { Image as ImageIcon, ShoppingBag } from "lucide-react";
import { Button } from "./ui";

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article
      className="bg-white rounded-2xl border border-neutral-150 overflow-hidden hover:border-neutral-250 transition-all flex flex-col justify-between"
      id={`product-${product.id}`}
    >
      <Link to={`/products/${product.id}`} className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-t-2xl block">
        <div className="relative aspect-video w-full bg-neutral-100 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-300">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold text-neutral-400 tracking-wide uppercase">
              {product.petType}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-[10px] font-semibold text-neutral-400 tracking-wide uppercase">
              {product.category}
            </span>
          </div>

          <h3 className="text-base font-display font-bold text-neutral-900 leading-snug mb-1.5 hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-neutral-500 leading-relaxed min-h-11">
            {product.description}
          </p>
        </div>
      </Link>

      <div className="px-5 pb-5 pt-2 border-t border-neutral-50">
        <div className="flex items-center justify-between">
          <span className="text-lg font-sans font-extrabold text-neutral-950">
            ${product.price.toFixed(2)}
          </span>

          <span
            className={`text-xs font-semibold ${
              product.stock < 20 ? "text-amber-600" : "text-neutral-500"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <Button
          onClick={() => onAddToCart(product)}
          disabled={product.stock <= 0}
          fullWidth
          className="mt-4"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}
