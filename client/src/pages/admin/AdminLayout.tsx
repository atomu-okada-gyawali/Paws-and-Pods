/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const TABS = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Users" },
];

export function AdminLayout() {
  const { user } = useApp();

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-neutral-950 tracking-tight">Admin</h1>
        <nav className="flex gap-1 mt-4 border-b border-neutral-200">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-t-lg ${
                  isActive
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
