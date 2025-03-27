import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RipsFacturaSearch from "./components/RipsFacturaSearch";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import './App.css';

const FacturaSearch = () => <div className="p-4">FacturaSearch en construcción...</div>;
const NotasCredito = () => <div className="p-4">Notas Crédito en construcción...</div>;
const NotasDebito = () => <div className="p-4">Notas Débito en construcción...</div>;
const NotasCreditoGlosas = () => <div className="p-4">Notas Crédito Glosas en construcción...</div>;
const RipsNotasCreditoGlosas = () => <div className="p-4">RIPS Notas Crédito Glosas en construcción...</div>;
const ReporteFacturacion = () => <div className="p-4">Reporte Facturación en construcción...</div>;
const ReporteRipsElectronicos = () => <div className="p-4">Reporte RIPS Electrónicos en construcción...</div>;

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header toggleSidebar={toggleSidebar} sidebarVisible={sidebarVisible} />
        <ToastContainer />
        <div className="d-flex flex-grow-1">
          {sidebarVisible && <Sidebar toggleSidebar={toggleSidebar} />}
          <div className={`flex-grow-1 p-4 ${sidebarVisible ? 'content-with-sidebar' : 'content-full'}`}>
            <Routes>
              <Route path="aplicativo_rips/build/rips-factura" element={<RipsFacturaSearch />} />
              <Route path="aplicativo_rips/build/factura" element={<FacturaSearch />} />
              <Route path="aplicativo_rips/build/notas-credito" element={<NotasCredito />} />
              <Route path="aplicativo_rips/build/notas-debito" element={<NotasDebito />} />
              <Route path="aplicativo_rips/build/notas-credito-glosas" element={<NotasCreditoGlosas />} />
              <Route path="aplicativo_rips/build/rips-notas-credito-glosas" element={<RipsNotasCreditoGlosas />} />
              <Route path="aplicativo_rips/build/reporte-facturacion" element={<ReporteFacturacion />} />
              <Route path="aplicativo_rips/build/reporte-rips-electronicos" element={<ReporteRipsElectronicos />} />
              <Route path="*" element={<RipsFacturaSearch />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;