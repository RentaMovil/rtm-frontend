import "./Notification.css";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../../../shared/components/layout/NavBarAdmin.jsx";
import FooterAdmin from "../../../shared/components/layout/FooterAdmin.jsx";
import NotificationCenter from "../components/NotificationCenter.jsx";

function NotificationAdmin() {
  const navigate = useNavigate();

  return (
    <>
      <NavbarAdmin />
      <NotificationCenter onBack={() => navigate(-1)} />
      <FooterAdmin />
    </>
  );
}

export default NotificationAdmin;
