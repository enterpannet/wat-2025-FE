import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import RegistrationForm from "./components/RegistrationForm";
import AdminLogin from "./components/admin/AdminLogin";
import AdminRegister from "./components/admin/AdminRegister";
import AdminDashboard from "./components/admin/AdminDashboard";
import RegistrationDashboard from "./components/admin/RegistrationDashboard";
import ListTum from "./components/admin/ListTum";
import ActivityLogPage from "./components/admin/ActivityLog";
import DeviceLog from "./components/DeviceLog";
import UserManagement from "./components/admin/UserManagement";
import SystemSelection from "./components/admin/SystemSelection";
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

        {/* System Selection - After login */}
        <Route
          path="/admin/select"
          element={
            <ProtectedRoute>
              <SystemSelection />
            </ProtectedRoute>
          }
        />

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

        {/* User Management - Available to all logged in users */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* ส่วนการลงทะเบียน (Registration Section) - Only for registration role */}
        <Route
          path="/admin/registration/list"
          element={
            <ProtectedRoute allowedRoles={["registration"]}>
              <RegistrationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registration/detail"
          element={
            <ProtectedRoute allowedRoles={["registration"]}>
              <ListTum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registration/activity-logs"
          element={
            <ProtectedRoute allowedRoles={["registration"]}>
              <ActivityLogPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes - redirect for backward compatibility */}
        <Route
          path="/admin/listtum"
          element={
            <ProtectedRoute allowedRoles={["registration"]}>
              <ListTum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity-logs"
          element={
            <ProtectedRoute allowedRoles={["registration"]}>
              <ActivityLogPage />
            </ProtectedRoute>
          }
        />

        {/* Finance Routes - ระบบรายรับรายจ่าย (แยกออกมา) */}
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
