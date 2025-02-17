import React from "react";
import FacturaSearch from "./components/FacturaSearch";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <FacturaSearch />
    </div>
  );
}

export default App;