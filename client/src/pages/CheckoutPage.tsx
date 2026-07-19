import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Card, Button, Alert } from "../components/ui";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export function CheckoutPage() {
  const { cart, user, accessToken, clearCart, setCompletedOrder, openAuth } =
    useApp();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  async function handleCheckout() {
    setCheckoutError(null);
    if (!user || !accessToken) {
      openAuth();
      return;
    }

    setCheckoutLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "We couldn't process your order.");
      }

      setCompletedOrder(data.order);
      clearCart();
      navigate("/order-confirmation");
    } catch (err: any) {
      console.error("Checkout issue:", err);
      setCheckoutError(
        err.message || "Something went wrong placing your order.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <ShoppingCart className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-510 font-medium text-sm mb-6">
          Your cart is empty.
        </p>
        <Link
          to="/"
          className="text-xs font-semibold text-emerald-700 hover:underline focus:outline-none focus:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="text-xs font-semibold text-neutral-500 hover:text-emerald-700 focus:outline-none focus:underline inline-flex items-center gap-1.5 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to shopping
      </Link>

      <Card className="sm:p-7">
        <h1 className="text-xl font-display font-bold text-neutral-900 mb-6">
          Checkout
        </h1>

        <div className="space-y-4 mb-6">
          {cart.map((item) => {
            const itemTotal = item.product.price * item.quantity;
            return (
              <div
                key={item.product.id}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100"
              >
                <img
                  src={item.product.imageUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover rounded-lg shrink-0 border border-neutral-150"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-neutral-900 truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    ${item.product.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  ${itemTotal.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-base text-neutral-900 font-bold border-t border-neutral-150 pt-5">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div className="mt-6 space-y-3">
          {checkoutError && <Alert variant="error">{checkoutError}</Alert>}

          {!user ? (
            <Button onClick={openAuth} fullWidth>
              Sign In to Continue
            </Button>
          ) : (
            <Button
              onClick={handleCheckout}
              variant="success"
              fullWidth
              loading={checkoutLoading}
            >
              Place Order
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
