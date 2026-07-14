import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import App from './App.tsx';
import {AppProvider} from './context/AppContext';
import {HomePage} from './pages/HomePage';
import {ProductDetailPage} from './pages/ProductDetailPage';
import {CheckoutPage} from './pages/CheckoutPage';
import {OrderConfirmationPage} from './pages/OrderConfirmationPage';
import {AccountPage} from './pages/AccountPage';
import {AdminLayout} from './pages/admin/AdminLayout';
import {AdminProductsPage} from './pages/admin/AdminProductsPage';
import {AdminOrdersPage} from './pages/admin/AdminOrdersPage';
import {AdminUsersPage} from './pages/admin/AdminUsersPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminProductsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
