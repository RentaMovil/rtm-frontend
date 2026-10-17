import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaCarSide } from "react-icons/fa6";
import "./Animation.css";
function Animation({ className, loop = false }) {
    const boxRef = useRef(null); // esta variable que guardara un div, ta que no puede manipular el doom
    const lineRef = useRef(null);
    const containerRef = useRef(null);

  useEffect(() => {// esta funcion esperara a que el div exista
    const ctx = gsap.context(() => {// esto agrupa  // todas las animaciones y la s envia se un solo
    // el carro recorre toda la línea, sea cual sea su ancho
    const dist = Math.max(lineRef.current.offsetWidth - boxRef.current.getBoundingClientRect().width, 0);

    if (loop) {
      // mientras se guarda: el carro avanza una y otra vez
      gsap.from(lineRef.current, { scaleX: 0, duration: 0.5, ease: "power2.out", transformOrigin: "left center" });
      gsap.timeline({ repeat: -1, repeatDelay: 0.1 })
        .fromTo(boxRef.current, { x: 0, opacity: 0 }, { opacity: 1, duration: 0.2 })
        .to(boxRef.current, { x: dist, duration: 1.1, ease: "power1.inOut" }, "<")
        .to(boxRef.current, { opacity: 0, duration: 0.2 });
      return;
    }

    const tl = gsap.timeline();

    tl.from(lineRef.current, {
        scaleX: 0,
        duration: 0.6,
        ease: "power2.out",
        transformOrigin: "left center"
      })
    .from(boxRef.current, {
      x: -50,
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    })
    .to(boxRef.current, {
        x: dist,
        duration: 1.2,
        ease: "power1.inOut",
    })
    .to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
    });
    });

    return () => ctx.revert(); // limpia animaciones
  }, [loop]);

  return (
    <div className={`animation-container ${className ? className : ""}`}>
      <div ref={containerRef} className="animation-cc">
        <div ref={lineRef} className="animation-line" />
        <FaCarSide ref={boxRef} className="animation-car" />
      </div>
    </div>
  );
}

export default Animation;