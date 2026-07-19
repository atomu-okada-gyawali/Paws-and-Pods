

import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Trash2, Plus, Minus, ShoppingCart, X } from "lucide-react";
import { IconButton, buttonVariants } from "./ui";

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem } = useApp();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        className="absolute inset-0 bg-black/50"
        onClick={closeCart}
        aria-label="Close cart"
      />

      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 id="cart-drawer-title" className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Your Cart
          </h2>
          <IconButton label="Close cart" onClick={closeCart}>
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="text-center py-16" role="status">
              <ShoppingCart className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium text-sm">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const itemTotal = item.product.price * item.quantity;
                return (
                  <div key={item.product.id} className="flex items-start gap-3.5">
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-lg shrink-0 border border-neutral-150"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.product.id}`}
                        onClick={closeCart}
                        className="text-sm font-semibold text-neutral-900 truncate block hover:text-emerald-700 focus:outline-none focus:underline"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-neutral-400 mt-0.5">${item.product.price.toFixed(2)} each</p>

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center rounded-lg border border-neutral-200 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 hover:bg-neutral-50 transition-colors disabled:opacity-40 text-neutral-600 focus:outline-none focus:bg-neutral-100"
                            aria-label={`Decrease quantity of ${item.product.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-neutral-700" aria-hidden="true">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2 py-1 hover:bg-neutral-50 transition-colors disabled:opacity-40 text-neutral-600 focus:outline-none focus:bg-neutral-100"
                            aria-label={`Increase quantity of ${item.product.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-neutral-900">${itemTotal.toFixed(2)}</span>
                          <IconButton
                            label={`Remove ${item.product.name} from cart`}
                            variant="danger"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-neutral-100">
            <div className="flex justify-between text-base font-bold text-neutral-900 mb-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={closeCart} className={buttonVariants({ fullWidth: true })}>
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
