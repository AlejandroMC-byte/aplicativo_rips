import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Styles/Header.css"; // Importa el archivo CSS personalizado

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg header-custom">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/rips-factura">
          Buscador de Facturas
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