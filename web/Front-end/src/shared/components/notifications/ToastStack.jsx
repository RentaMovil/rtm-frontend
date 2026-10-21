import "./ToastStack.css";

/** Pila de avisos abajo-derecha; cada uno se autodescarta solo (ver NotificationRealtimeContext). */
export default function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-item" onClick={() => onDismiss(toast.id)}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
