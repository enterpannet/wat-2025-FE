import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import RegistrationForm from "./components/RegistrationForm";
import AdminLogin from "./components/admin/AdminLogin";
import AdminRegister from "./components/admin/AdminRegister";
import AdminDashboard from "./components/admin/AdminDashboard";
import RegistrationDashboard from "./components/admin/RegistrationDashboard";
import FinanceDashboard from "./components/admin/FinanceDashboard";
import ListTum from "./components/admin/ListTum";
import IncomeExpense from "./components/admin/IncomeExpense";
import Summary from "./components/admin/Summary";
import ActivityLogPage from "./components/admin/ActivityLog";
import DeviceLog from "./components/DeviceLog";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - ไม่ต้อง login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/registration" element={<RegistrationForm />} />
        <Route path="/device-log" element={<DeviceLog />} />

        {/* Admin Routes - Public */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Admin Routes - Protected (ต้อง login ก่อน) */}
        
        {/* Main Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ส่วนการลงทะเบียน (Registration Section) */}
        <Route
          path="/admin/registration/list"
          element={
            <ProtectedRoute>
              <RegistrationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registration/detail"
          element={
            <ProtectedRoute>
              <ListTum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registration/activity-logs"
          element={
            <ProtectedRoute>
              <ActivityLogPage />
            </ProtectedRoute>
          }
        />

        {/* ส่วนรายรับ-รายจ่าย (Finance/Transaction Section) */}
        <Route
          path="/admin/finance/transactions"
          element={
            <ProtectedRoute>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finance/manage"
          element={
            <ProtectedRoute>
              <IncomeExpense />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finance/summary"
          element={
            <ProtectedRoute>
              <Summary />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes - redirect for backward compatibility */}
        <Route
          path="/admin/listtum"
          element={
            <ProtectedRoute>
              <ListTum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/income-expense"
          element={
            <ProtectedRoute>
              <IncomeExpense />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/summary"
          element={
            <ProtectedRoute>
              <Summary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity-logs"
          element={
            <ProtectedRoute>
              <ActivityLogPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
