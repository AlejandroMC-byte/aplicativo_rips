import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styles/Header.css"; // Importa el archivo CSS personalizado

const Header = ({ toggleSidebar, sidebarVisible }) => {
  return (
    <nav className="navbar navbar-expand-lg header-custom">
      <div className="container d-flex align-items-center">
        {/* Ocultar el botón cuando el Sidebar está visible */}
        <button
          className={`btn btn-primary me-3 menu-button ${sidebarVisible ? "d-none" : ""}`}
          onClick={toggleSidebar}
        >
          ☰
        </button>
        <Link
          className={`navbar-brand fw-bold ${sidebarVisible ? "ms-0" : "ms-auto"}`}
          to="/rips-factura"
        >
          Buscador de Documentos
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/rips-factura">
                Rips Factura
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/factura">
                Factura Electronica
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;