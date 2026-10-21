import "./NotificationBadge.css";

export default function NotificationBadge({ count }) {
  if (!count) return null;

  return <span className="notif-badge">{count > 9 ? "9+" : count}</span>;
}
