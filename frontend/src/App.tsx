import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages are lazy-loaded so each route's bundle is only fetched when first visited.
const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const CheckEmailPage = lazy(() => import("./pages/CheckEmailPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: "32px", textAlign: "center" }}>Loading...</div>}>
        <Routes>
          {/* Public routes — anyone can visit */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected route — redirects to /login if not authenticated */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />

          {/* Default — visiting "/" redirects to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
