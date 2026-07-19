/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { Outlet, Link } from "react-router-dom";
import { AuthModal } from "./components/AuthModal";
import { CartDrawer } from "./components/CartDrawer";
import { useApp } from "./context/AppContext";
import { LayoutDashboard, Leaf, LogOut, ShoppingCart, User } from "lucide-react";
import { Button, IconButton } from "./components/ui";

export default function App() {
  const { user, logout, isAuthOpen, openAuth, closeAuth, setAuth, announce, ariaLiveAnnouncement, cart, openCart } = useApp();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-between">
      {/* Screen-reader-only live region for cart/status updates */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {ariaLiveAnnouncement}
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg">
            <div className="p-2 bg-emerald-700 rounded-xl text-white">
              <Leaf className="w-5.5 h-5.5" />
            </div>
            <span className="text-lg font-bold font-display tracking-tight text-neutral-900 leading-tight">
              Paws & Pods
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-neutral-50 p-1.5 pl-3.5 pr-2 rounded-xl border border-neutral-150">
                <Link
                  to="/account"
                  className="flex items-center gap-2 text-xs rounded-lg px-1 py-0.5 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  title="Account security"
                >
                  <User className="w-4 h-4 text-neutral-500" />
                  <span className="font-semibold text-neutral-700">{user.email}</span>
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="p-2 text-neutral-500 hover:text-emerald-700 hover:bg-white rounded-lg border border-transparent hover:border-neutral-200 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Admin panel"
                    title="Admin panel"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                  </Link>
                )}
                <IconButton label="Sign out" variant="danger" onClick={logout} className="p-2">
                  <LogOut className="w-4 h-4" />
                </IconButton>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={openAuth}
                className="text-neutral-900 hover:bg-neutral-950 hover:text-white"
              >
                Sign In
              </Button>
            )}

            <IconButton
              label={`Open cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              onClick={openCart}
              className="relative p-2.5 rounded-xl text-neutral-700"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </IconButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-neutral-100 py-6 mt-16 text-center text-xs text-neutral-450">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© 2026 Paws & Pods. Quality pet products, delivered with care.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={closeAuth}
        onSuccess={(userData, tokenData) => setAuth(userData, tokenData)}
        onAnnounce={announce}
      />

      <CartDrawer />
    </div>
  );
}
