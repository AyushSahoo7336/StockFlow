import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import HomePage from "./pages/HomePage";
import Navbar from "./pages/Navbar";
import MarketView from './pages/MarketView';
import Signup from "./auth/Signup";
import Login from "./auth/Login";

import DashboardLayout from "./dashboard/DashboardLayout";
import PortfolioView from "./dashboard/PortfolioView";
import ProfileSection from "./dashboard/ProfileSection";
import OrdersView from './dashboard/OrdersView';


function PublicLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
        <h3>Loading secure trade engine...</h3>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          <Route path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PortfolioView />} />
            <Route path="profile" element={<ProfileSection />} />
            <Route path="market" element={<MarketView />} />
            <Route path="orders" element={<OrdersView />} />
          </Route>

          <Route path="/*" element={<PublicLayout />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}