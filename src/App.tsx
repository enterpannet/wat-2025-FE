import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm";
import AdminLogin from "./components/admin/AdminLogin";
import AdminRegister from "./components/admin/AdminRegister";
import AdminDashboard from "./components/admin/AdminDashboard";
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
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/device-log" element={<DeviceLog />} />

        {/* Admin Routes - Public */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Admin Routes - Protected (ต้อง login ก่อน) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
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
