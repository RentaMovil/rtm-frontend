import './App.css'
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Auth
import Login from './features/auth/pages/Login.jsx';
// /account y /account/admin usan el mismo componente: el prop `admin` solo cambia
// el Navbar y el Footer. Antes cada ruta tenía su propio perfil y divergían.
import AccountView from './features/auth/components/AccountView';
import AccountAdmin from './features/account/pages/AccountAdmin.jsx';

import ChangePassword from './features/auth/pages/ChangePassword.jsx';

import VehicleInventory from './features/admin/VehicleInventory/pages/VehicleInventory.jsx';
// Vehicles
import Home from './features/vehicles/pages/Home.jsx';
import HomeS from './features/vehicles/pages/HomeS.jsx';

// Booking
import Reservation from './features/booking//pages/Reservation.jsx';
import HistorialReservation from './features/booking/pages/HistorialReservation.jsx';

// Payment
import Payment from './features/payment/pages/Payment.jsx';
import { RequireAuth, RequireRole } from './shared/components/ProtectedRoute.jsx';

// Notification
import Notification from './features/notification/pages/Notification.jsx';
import NotificationAdmin from './features/notification/pages/NotificationAdmin.jsx';

// Admin - Vehicles
import RegisterVehicle from './features/admin/registerVehicle/pages/RegisterVehicle.jsx';

// Admin - Maintenance
import Maintenance from './features/admin/registerMaintenance/pages/Maintenance.jsx';

// Admin - HomeAdmin
import HomeAdmin from './features/admin/HomeAdmin/pages/HomeAdmin.jsx';

import InsuranceTypes from './features/admin/insuranceTypes/pages/InsuranceTypes.jsx';
import Branches from './features/admin/branches/pages/Branches.jsx';
import ReservationsList from './features/admin/reservations/pages/ReservationsList.jsx';
import ReservationDetail from './features/admin/reservations/pages/ReservationDetail.jsx';
import VehicleLocation from './features/admin/vehicleLocation/pages/VehicleLocation.jsx';
import RouteHistory from './features/admin/routeHistory/pages/RouteHistory.jsx';


import History from './features/admin/historyMaintenance/pages/History.jsx';

import RegisterForm from './features/auth/components/RegisterForm.jsx';

import EmailVerification from './features/auth/pages/EmailVerification.jsx';

import CodeVerification from "./features/auth/pages/CodeVerification.jsx";

import ChangePasswordLogin from './features/auth/pages/ChangePasswordLogin.jsx';

//----------

// Super Admin
import UserManagement from './features/admin/users/pages/UserManagement.jsx';
import BankAccounts from './features/admin/bankAccounts/pages/BankAccounts.jsx';




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

      <Routes>
        <Route path="/" element={<Login theme={theme} setTheme={setTheme} />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/Register" element={<RegisterForm />} />
        <Route path="/EmailVerification" element={<EmailVerification />} />
        <Route path="/CodeVerification" element={<CodeVerification />} />
        <Route path="/ChangePasswordLogin" element={<ChangePasswordLogin />} />

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
        {/* El home de cliente es solo para CLIENT: los admins tienen el mismo home en /HomeAdmin */}
        <Route
          path="/home"
          element={
            <RequireRole roles={["CLIENT"]}>
              <Home />
            </RequireRole>
          }
        />
        <Route
          path="/homeS"
          element={
            <RequireAuth>
              <HomeS />
            </RequireAuth>
          }
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
