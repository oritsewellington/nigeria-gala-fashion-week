import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useAppDispatch } from "./app/hooks";
import { useLazyGetMeQuery } from "./features/auth/authApi";
import { setCredentials, clearCredentials } from "./features/auth/authSlice";

import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/public/Home";
import Categories from "./pages/public/Categories";
import CategoryDetail from "./pages/public/CategoryDetail";
import ContestantProfile from "./pages/public/ContestantProfile";
import VotePage from "./pages/public/VotePage";
import VoteCallback from "./pages/public/VoteCallback";
import Leaderboard from "./pages/public/Leaderboard";
import About from "./pages/public/About";
import Login from "./pages/public/Login";
import NotFound from "./pages/public/NotFound";

import DashboardOverview from "./pages/dashboard/DashboardOverview";
import CategoriesManage from "./pages/dashboard/CategoriesManage";
import SponsorsManage from "./pages/dashboard/SponsorsManage";
import ContestantsManage from "./pages/dashboard/ContestantsManage";
import Transactions from "./pages/dashboard/Transactions";
import Payouts from "./pages/dashboard/Payouts";
import SettingsPage from "./pages/dashboard/SettingsPage";
import Admins from "./pages/dashboard/Admins";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const dispatch = useAppDispatch();
  const [getMe] = useLazyGetMeQuery();

  // On app load, silently check if there's a valid session cookie.
  // This never shows an error toast — an absent session is expected
  // for the vast majority of (public, non-logged-in) visitors.
  useEffect(() => {
    getMe()
      .unwrap()
      .then((res) => dispatch(setCredentials({ user: res.data.user })))
      .catch(() => dispatch(clearCredentials()));
  }, [dispatch, getMe]);

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: "#1c1c28",
            border: "1px solid #313142",
            color: "#e2e2e5",
          },
        }}
      />

      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:slug" element={<CategoryDetail />} />
          <Route path="/contestant/:id" element={<ContestantProfile />} />
          <Route path="/vote/:contestantId" element={<VotePage />} />
          <Route path="/vote/callback" element={<VoteCallback />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Dashboard (nested, protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="categories" element={<CategoriesManage />} />
          <Route path="contestants" element={<ContestantsManage />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="sponsors" element={<SponsorsManage />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admins"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <Admins />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
