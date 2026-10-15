import "./Notification.css";
import { useNavigate } from "react-router-dom";
import { RoleNavbar, RoleFooter } from "../../../shared/components/layout/RoleChrome.jsx";
import NotificationCenter from "../components/NotificationCenter.jsx";

function Notification() {
  const navigate = useNavigate();

  return (
    <>
      <RoleNavbar />
      <NotificationCenter onBack={() => navigate(-1)} />
      <RoleFooter />
    </>
  );
}

export default Notification;
