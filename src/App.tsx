import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/login.page";
import { Toaster } from "sonner";
import React from "react";
import { ProtectedRoute } from "./components/protected-route";
import DashboardPage from "./features/dashboard/dashboard.page";
import { AdminLayout } from "./layout/admin-layout";
import UsersPage from "./features/users/users.page";
import MediaPage from "./features/media/media.page";

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
            <Route path="/stickers" element={<MediaPage type="stickers" />} />
            <Route path="/emojis" element={<MediaPage type="emojis" />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </React.Fragment>
  );
};

export default App;
