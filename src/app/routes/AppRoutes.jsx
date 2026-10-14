import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AuthRoute from '@/app/routes/AuthRoute.jsx';
import PrivateRoute from '@/app/routes/PrivateRoute.jsx';
import useAutoLogout from '@/shared/hooks/useAutoLogout.js';
import PageState from '@/shared/components/PageState.jsx';

const Login = lazy(() => import('@/features/auth/pages/Login.jsx'));
const OtpLogin = lazy(() => import('@/features/auth/pages/OtpLogin.jsx'));
const Blocked = lazy(() => import('@/features/auth/pages/Blocked.jsx'));
const ForgotRequest = lazy(
  () => import('@/features/auth/pages/ForgotPasswordRequest.jsx'),
);
const ForgotOtp = lazy(
  () => import('@/features/auth/pages/ForgotPasswordOtp.jsx'),
);
const ForgotReset = lazy(
  () => import('@/features/auth/pages/ForgotPasswordReset.jsx'),
);
const Dashboard = lazy(
  () => import('@/features/dashboard/pages/Dashboard.jsx'),
);
const LifeGoals = lazy(
  () => import('@/features/life-goals/pages/LifeGoals.jsx'),
);
const LifeGoalDetail = lazy(
  () => import('@/features/life-goals/pages/LifeGoalsDetail.jsx'),
);
const Deposit = lazy(() => import('@/features/deposit/pages/Deposit.jsx'));
const Profile = lazy(() => import('@/features/profile/pages/Profile.jsx'));
const CardSection = lazy(() => import('@/features/card/pages/CardSection.jsx'));
const DetailMyCard = lazy(
  () => import('@/features/card/pages/DetailMyCard.jsx'),
);
const Saving = lazy(() => import('@/features/saving/pages/Saving.jsx'));
const PensionFunds = lazy(
  () => import('@/features/pension-funds/pages/PensionFunds.jsx'),
);
const SplitBill = lazy(
  () => import('@/features/split-bill/pages/SplitBill.jsx'),
);
const SplitBillDetail = lazy(
  () => import('@/features/split-bill/pages/SplitBillDetail.jsx'),
);
const AdminHome = lazy(
  () => import('@/features/admin-dashboard/pages/AdminHome.jsx'),
);
const AdminTransactions = lazy(
  () => import('@/features/admin-dashboard/pages/AdminTransactions.jsx'),
);
const AdminUsers = lazy(
  () => import('@/features/admin-dashboard/pages/AdminUsers.jsx'),
);
const AdminUserDetail = lazy(
  () => import('@/features/admin-dashboard/pages/AdminUserDetail.jsx'),
);
const AdminActivity = lazy(
  () => import('@/features/admin-dashboard/pages/AdminActivity.jsx'),
);
const AdminActivityDetail = lazy(
  () => import('@/features/admin-dashboard/pages/AdminActivityDetail.jsx'),
);
const NotFound = lazy(() => import('@/app/routes/NotFound.jsx'));

export default function AppRoutes() {
  const { pathname } = useLocation();
  useAutoLogout();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = pathname.startsWith('/admin')
      ? 'Admin · Wandoor'
      : 'Wandoor · Ruang keuangan Anda';
  }, [pathname]);
  return (
    <Suspense fallback={<PageState loading />}>
      <Routes>
        <Route element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otpLogin" element={<OtpLogin />} />
          <Route path="/popupblock" element={<Blocked />} />
          <Route path="/forgot" element={<ForgotRequest />} />
          <Route path="/forgot/otp" element={<ForgotOtp />} />
          <Route path="/forgot/reset" element={<ForgotReset />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lifegoals" element={<LifeGoals />} />
          <Route path="/lifegoal/:id" element={<LifeGoalDetail />} />
          <Route path="/deposits" element={<Deposit />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mycard" element={<CardSection />} />
          <Route path="/detailmycard" element={<DetailMyCard />} />
          <Route path="/savings" element={<Saving />} />
          <Route path="/pensionfunds" element={<PensionFunds />} />
          <Route path="/splitbill" element={<SplitBill />} />
          <Route path="/splitbill/detail" element={<SplitBillDetail />} />
        </Route>
        <Route element={<PrivateRoute admin />}>
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/detail" element={<AdminUserDetail />} />
          <Route path="/admin/activity" element={<AdminActivity />} />
          <Route
            path="/admin/activity/detail"
            element={<AdminActivityDetail />}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
