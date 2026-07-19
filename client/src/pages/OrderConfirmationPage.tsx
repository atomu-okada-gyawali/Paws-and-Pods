import { Navigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { CheckCircle2 } from "lucide-react";

export function OrderConfirmationPage() {
  const { completedOrder, setCompletedOrder } = useApp();

  if (!completedOrder) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="p-6 sm:p-8 bg-emerald-50 rounded-2xl border border-emerald-200/60 shadow-sm relative overflow-hidden"
        id="checkout-success"
        role="status"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-md shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-neutral-900 mb-1">
              Order Confirmed!
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed mb-4">
              Thanks for your order. We'll send a confirmation email with
              shipping details shortly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/70 p-4 rounded-xl border border-emerald-100 text-xs text-neutral-700">
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider mb-0.5">
                  Order Number
                </span>
                <span className="text-neutral-900 select-all">
                  {completedOrder.id}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider mb-0.5">
                  Total
                </span>
                <span className="text-neutral-900 font-bold">
                  ${completedOrder.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/"
        onClick={() => setCompletedOrder(null)}
        className="mt-6 inline-block text-xs font-semibold text-emerald-700 hover:underline focus:outline-none focus:underline"
      >
        Continue shopping
      </Link>
    </div>
  );
}
