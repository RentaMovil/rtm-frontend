import LogoCar from "./LogoCar";
import './Navbar.css';
import './NavbarTwo.css';


function NavbarTwo(){
    return (
    <nav className="nav-navbarCard">
        <div className="logo-container">
            <h2 className="Title">Renta<span className="subName">Movil</span></h2>
            <LogoCar className="logo-icon" />
        </div>
    </nav>
    
)

}
export default NavbarTwo;