import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import WhatsAppButton from "./components/WhatsAppButton";
import BillingPage from "./pages/BillingPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<BillingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <WhatsAppButton />
    </div>
  );
}
