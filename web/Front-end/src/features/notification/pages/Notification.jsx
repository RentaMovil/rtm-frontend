import "./Notification.css";
import { RoleNavbar, RoleFooter } from "../../../shared/components/layout/RoleChrome.jsx";
import NotificationCenter from "../components/NotificationCenter.jsx";

function Notification() {
  return (
    <>
      <RoleNavbar />
      <NotificationCenter />
      <RoleFooter />
    </>
  );
}

export default Notification;
