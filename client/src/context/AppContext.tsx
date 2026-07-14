/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, ReactNode } from "react";
import { Product, CartItem, UserState } from "../types";

export interface CompletedOrder {
  id: string;
  status: string;
  totalAmount: string;
  paymentTrackingHash: string;
}

interface AnnouncementLog {
  id: string;
  text: string;
  timestamp: string;
}

interface AppContextValue {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;

  user: UserState | null;
  accessToken: string | null;
  setAuth: (user: UserState, token: string) => void;
  logout: () => void;

  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;

  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  completedOrder: CompletedOrder | null;
  setCompletedOrder: (order: CompletedOrder | null) => void;

  ariaLiveAnnouncement: string;
  announcementLogs: AnnouncementLog[];
  announce: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserState | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [ariaLiveAnnouncement, setAriaLiveAnnouncement] = useState("");
  const [announcementLogs, setAnnouncementLogs] = useState<AnnouncementLog[]>([]);

  function announce(message: string) {
    setAriaLiveAnnouncement(message);
    const timestamp = new Date().toLocaleTimeString();
    setAnnouncementLogs((prev) => [
      { id: Math.random().toString(), text: message, timestamp },
      ...prev.slice(0, 4),
    ]);
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          announce(`Cannot add more of ${product.name}, stock limit reached.`);
          return prevCart;
        }
        announce(`Updated quantity of ${product.name} inside cart to ${existing.quantity + 1}.`);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      announce(`Added ${product.name} to checkout cart list.`);
      return [...prevCart, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prevCart) => {
      const target = prevCart.find((item) => item.product.id === productId);
      if (!target) return prevCart;

      const nextQty = target.quantity + delta;
      if (nextQty <= 0) {
        announce(`Removed ${target.product.name} from selection.`);
        return prevCart.filter((item) => item.product.id !== productId);
      }

      if (nextQty > target.product.stock) {
        announce(`Stock limit reached for ${target.product.name}. Cannot exceed ${target.product.stock} units.`);
        return prevCart;
      }

      announce(`Updated quantity of ${target.product.name} to ${nextQty}.`);
      return prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: nextQty } : item
      );
    });
  }

  function removeItem(productId: string) {
    const item = cart.find((i) => i.product.id === productId);
    if (item) {
      announce(`Removed ${item.product.name} from cart.`);
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    }
  }

  function clearCart() {
    setCart([]);
  }

  function setAuth(userData: UserState, token: string) {
    setUser(userData);
    setAccessToken(token);
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      announce("Logged out successfully. Terminated active user session safely.");
    } catch (err) {
      console.error("Logout exception:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }

  const value: AppContextValue = {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    user,
    accessToken,
    setAuth,
    logout,
    isAuthOpen,
    openAuth: () => setIsAuthOpen(true),
    closeAuth: () => setIsAuthOpen(false),
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    completedOrder,
    setCompletedOrder,
    ariaLiveAnnouncement,
    announcementLogs,
    announce,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
