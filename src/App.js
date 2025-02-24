import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RipsFacturaSearch from "./components/RipsFacturaSearch";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header"; // Cambiado de Footer a Header

// Componente temporal para FacturaSearch
const FacturaSearch = () => <div className="p-4">FacturaSearch en construcción...</div>;

function App() {
  return (
    <Router> {/* Router solo aquí */}
      <div className="App d-flex flex-column min-vh-100">
        <Header /> {/* Agregamos el Header */}
        <ToastContainer />
        <div className="flex-grow-1 p-4">
          <Routes>
            <Route path="/rips-factura" element={<RipsFacturaSearch />} />
            <Route path="/factura" element={<FacturaSearch />} />
            <Route path="*" element={<RipsFacturaSearch />} /> {/* Vista por defecto */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
