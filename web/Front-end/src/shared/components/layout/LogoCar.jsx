// Logo de RentaMovil: carro visto de frente, de un solo tono.
// Toma el color del texto (currentColor, p. ej. --accent en .logo-icon)
// y los "huecos" usan el fondo de la navbar (--navbar), asi sigue el tema.
// Se dimensiona con font-size (1em), igual que los iconos de react-icons.
function LogoCar({ className = "", title = "RentaMovil" }) {
  const hueco = "var(--navbar)";
  return (
    <svg
      className={className}
      viewBox="20 44 216 182"
      width="1.2em"
      height="1em"
      role="img"
      aria-label={title}
      style={{ display: "inline-block", overflow: "visible" }}
    >
      {/* ruedas */}
      <rect x="46" y="188" width="26" height="28" rx="8" fill={hueco} stroke="currentColor" strokeWidth="3" />
      <rect x="184" y="188" width="26" height="28" rx="8" fill={hueco} stroke="currentColor" strokeWidth="3" />
      {/* espejos */}
      <circle cx="38" cy="112" r="9" fill="currentColor" />
      <circle cx="218" cy="112" r="9" fill="currentColor" />
      {/* cabina y parabrisas */}
      <path d="M62 120 C68 84 94 56 128 56 C162 56 188 84 194 120 Z" fill="currentColor" />
      <path d="M73 116 C79 88 99 68 128 68 C157 68 177 88 183 116 Z" fill={hueco} />
      {/* carroceria */}
      <path d="M34 128 C34 116 42 112 56 112 L200 112 C214 112 222 116 222 128 L226 176 C226 194 218 202 206 202 L50 202 C38 202 30 194 30 176 Z" fill="currentColor" />
      {/* faros */}
      <ellipse cx="68" cy="148" rx="17" ry="8" transform="rotate(8 68 148)" fill={hueco} />
      <ellipse cx="188" cy="148" rx="17" ry="8" transform="rotate(-8 188 148)" fill={hueco} />
      {/* parrilla */}
      <path d="M86 150 L170 150 C170 172 152 186 128 186 C104 186 86 172 86 150 Z" fill={hueco} />
      {/* antiniebla y placa */}
      <ellipse cx="56" cy="178" rx="9" ry="5" fill={hueco} />
      <ellipse cx="200" cy="178" rx="9" ry="5" fill={hueco} />
      <rect x="102" y="193" width="52" height="4" rx="2" fill={hueco} />
    </svg>
  );
}

export default LogoCar;
