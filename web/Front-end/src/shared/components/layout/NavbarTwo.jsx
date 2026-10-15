import { FaCar } from "react-icons/fa";
import './NavbarTwo.css';


function NavbarTwo(){
    return (
    <nav className="nav-navbarCard">
        <div className="logo-container">
            <h2 className="Title">Renta<span className="subName">Movil</span></h2>
            <FaCar className='icon'/>
        </div>
    </nav>
    
)

}
export default NavbarTwo;