import './App.css'
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Auth
import Login from './features/auth/pages/Login.jsx';
// /account y /account/admin usan el mismo componente: el prop `admin` solo cambia
// el Navbar y el Footer. Antes cada ruta tenía su propio perfil y divergían.
import AccountView from './features/auth/components/AccountView';
// Auth - Change Password
import ChangePassword from './features/auth/pages/ChangePassword.jsx';
// Vehicles
import Home from './features/vehicles/pages/Home.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
// Booking
import Reservation from './features/booking//pages/Reservation.jsx';
import HistorialReservation from './features/booking/pages/HistorialReservation.jsx';
// Payment
import Payment from './features/payment/pages/Payment.jsx';
import { RequireAuth, RequireRole } from './shared/components/ProtectedRoute.jsx';
// Notification
import Notification from './features/notification/pages/Notification.jsx';
// Admin - Vehicles
import VehicleInventory from './features/admin/VehicleInventory/pages/VehicleInventory.jsx';
// Admin - Account
import AccountAdmin from './features/account/pages/AccountAdmin.jsx';
// Admin - Notification
import NotificationAdmin from './features/notification/pages/NotificationAdmin.jsx';
// Admin - Vehicles
import RegisterVehicle from './features/admin/registerVehicle/pages/RegisterVehicle.jsx';
// Admin - Maintenance
import Maintenance from './features/admin/registerMaintenance/pages/Maintenance.jsx';
// Admin - HomeAdmin
import HomeAdmin from './features/admin/HomeAdmin/pages/HomeAdmin.jsx';
// Admin - Insurance Types
import InsuranceTypes from './features/admin/insuranceTypes/pages/InsuranceTypes.jsx';
// Admin - Branches
import Branches from './features/admin/branches/pages/Branches.jsx';
// Admin - Reservations
import ReservationsList from './features/admin/reservations/pages/ReservationsList.jsx';
// Admin - Reservation Detail
import ReservationDetail from './features/admin/reservations/pages/ReservationDetail.jsx';
// Admin - Vehicle Location
import VehicleLocation from './features/admin/vehicleLocation/pages/VehicleLocation.jsx';
// Admin - Route History
import RouteHistory from './features/admin/routeHistory/pages/RouteHistory.jsx';
// Admin - History Maintenance
import History from './features/admin/historyMaintenance/pages/History.jsx';
// Auth - Register
import RegisterForm from './features/auth/components/RegisterForm.jsx';
// Auth - Email Verification
import EmailVerification from './features/auth/pages/EmailVerification.jsx';
// Auth - Code Verification
import CodeVerification from "./features/auth/pages/CodeVerification.jsx";
// Auth - Change Password Login
import ChangePasswordLogin from './features/auth/pages/ChangePasswordLogin.jsx';
// Super Admin
import UserManagement from './features/admin/users/pages/UserManagement.jsx';
import BankAccounts from './features/admin/bankAccounts/pages/BankAccounts.jsx';
import MobileAppBanner from './shared/components/MobileAppBanner/MobileAppBanner.jsx';

// Admin con sesión ya restaurada: lleva directo a HomeAdmin, sin esperar a que
// entre a /account para que la navbar refleje el rol real.
const ROLES_ADMIN = ["ADMIN", "SUPER_ADMIN"];

function HomeGate() {
  const { user } = useAuth();
  return ROLES_ADMIN.includes(user?.role) ? <HomeAdmin /> : <Home />;
}

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "skylight"
  );

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <BrowserRouter>
      <MobileAppBanner />

      <Routes>
        <Route 
          path="/" 
          element={
            <HomeGate />
          } 
        />
        <Route 
          path="/login" 
          element={
            <Login theme={theme} setTheme={setTheme} />
          }
        />
        <Route 
          path="/register"
          element={
          <RegisterForm />
          } />
        <Route 
          path="/Register" 
          element={
            <RegisterForm />
          }
        />
        <Route 
          path="/EmailVerification" 
          element={
          <EmailVerification />
          }
        />
        <Route 
          path="/CodeVerification" 
          element={
            <CodeVerification />
          }
        />
        <Route 
          path="/ChangePasswordLogin"
          element={
            <ChangePasswordLogin />
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountView theme={theme} setTheme={setTheme} />
            </RequireAuth>
          }
        />
        <Route
          path="/account/admin"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <AccountAdmin theme={theme} setTheme={setTheme} />
            </RequireRole>
          }
        />
        <Route
          path="/ChangePassword"
          element={
            <RequireAuth>
              <ChangePassword />
            </RequireAuth>
          }
        />
        {/* Público: cualquiera puede navegar el catálogo sin sesión. Reservar
            (botón "Continuar") y el resto de la navbar sí la exigen. */}
        <Route
          path="/home"
          element={<HomeGate />}
        />
        <Route
          path="/reservation"
          element={
            <RequireAuth>
              <Reservation />
            </RequireAuth>
          }
        />
        <Route
          path="/HistorialReservation"
          element={
            <RequireAuth>
              <HistorialReservation />
            </RequireAuth>
          }
        />
        <Route
          path="/payment"
          element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          }
        />
        <Route
          path="/Notification"
          element={
            <RequireAuth>
              <Notification />
            </RequireAuth>
          }
        />

        <Route
          path="/NotificationAdmin"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <NotificationAdmin />
            </RequireRole>
          }
        />
        <Route
          path="/notificationAdmin"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <NotificationAdmin />
            </RequireRole>
          }
        />
        <Route
          path="/RegisterVehicle"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <RegisterVehicle />
            </RequireRole>
          }
        />
        <Route
          path="/Maintenance"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <Maintenance />
            </RequireRole>
          }
        />
        <Route
          path="/HomeAdmin"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <HomeAdmin />
            </RequireRole>
          }
        />
        <Route
          path="/homeAdmin"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <HomeAdmin />
            </RequireRole>
          }
        />
        <Route
          path="/home-admin"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <HomeAdmin />
            </RequireRole>
          }
        />
        <Route
          path="/History"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <History />
            </RequireRole>
          }
        />
        <Route
          path="/VehicleInventory"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <VehicleInventory />
            </RequireRole>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]} permission="roles:grant">
              <UserManagement />
            </RequireRole>
          }
        />
        <Route
          path="/admin/bank-accounts"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]} permission="bank-accounts:manage">
              <BankAccounts />
            </RequireRole>
          }
        />
        <Route
          path="/insurance-types"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <InsuranceTypes />
            </RequireRole>
          }
        />
        <Route
          path="/branches"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <Branches />
            </RequireRole>
          }
        />
        <Route
          path="/reservations"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <ReservationsList />
            </RequireRole>
          }
        />
        <Route
          path="/reservations/:id"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <ReservationDetail />
            </RequireRole>
          }
        />
        <Route
          path="/VehicleLocation"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <VehicleLocation />
            </RequireRole>
          }
        />
        <Route
          path="/RouteHistory"
          element={
            <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
              <RouteHistory />
            </RequireRole>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
