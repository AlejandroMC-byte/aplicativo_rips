import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Styles/Sidebar.css';

function Sidebar({ toggleSidebar }) {
  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 sidebar-custom">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 link-light text-decoration-none">Panel de Navegación</h5>
        <button
          className="btn btn-light btn-sm ms-2"
          onClick={toggleSidebar}
          title="Ocultar Sidebar"
        >
          ←
        </button>
      </div>
      <hr className="text-white" />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <a
            className="nav-link link-light"
            data-bs-toggle="collapse"
            href="#facturacionMenu"
            role="button"
            aria-expanded="false"
            aria-controls="facturacionMenu"
          >
            Facturación
          </a>
          <div className="collapse" id="facturacionMenu">
            <ul className="nav flex-column ms-3">
              <li className="nav-item">
                <Link to="/factura" className="nav-link link-light">
                  Facturas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/notas-credito" className="nav-link link-light">
                  Notas Crédito
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/notas-debito" className="nav-link link-light">
                  Notas Débito
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/notas-credito-glosas" className="nav-link link-light">
                  Notas Crédito Glosas
                </Link>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a
            className="nav-link link-light"
            data-bs-toggle="collapse"
            href="#ripsMenu"
            role="button"
            aria-expanded="false"
            aria-controls="ripsMenu"
          >
            RIPS
          </a>
          <div className="collapse" id="ripsMenu">
            <ul className="nav flex-column ms-3">
              <li className="nav-item">
                <Link to="/rips-factura" className="nav-link link-light">
                  RIPS Facturas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/rips-notas-credito-glosas" className="nav-link link-light">
                  RIPS Notas Crédito Glosas
                </Link>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a
            className="nav-link link-light"
            data-bs-toggle="collapse"
            href="#administrativoMenu"
            role="button"
            aria-expanded="false"
            aria-controls="administrativoMenu"
          >
            Administrativo
          </a>
          <div className="collapse" id="administrativoMenu">
            <ul className="nav flex-column ms-3">
              <li className="nav-item">
                <Link to="/reporte-facturacion" className="nav-link link-light">
                  Reporte Facturación
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/reporte-rips-electronicos" className="nav-link link-light">
                  Reporte RIPS Electrónicos
                </Link>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;