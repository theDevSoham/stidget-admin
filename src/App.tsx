import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/login.page";
import { Toaster } from "sonner";
import React from "react";
import { ProtectedRoute } from "./components/protected-route";
import DashboardPage from "./features/dashboard/dashboard.page";
import { AdminLayout } from "./layout/admin-layout";
import StickersPage from "./features/stickers/stickers.page";

const App = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/stickers" element={<StickersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </React.Fragment>
  );
};

export default App;
