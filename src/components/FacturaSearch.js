import { useState } from "react";
import BotonesJson from "./BotonesJson";
import { toast } from "react-toastify";
function BuscadorFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [filtros, setFiltros] = useState({ prefijo: "", factura_fiscal: "", fecha_registro: "" });
  const [mensaje, setMensaje] = useState("");

  const buscarFacturas = async () => {
    const requestBody = { ...filtros, consultarFacturas: '1' };
    // console.log("Request Body:", requestBody); // Log para verificar el cuerpo de la solicitud
    const response = await fetch(`http://localhost:4000/api/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    console.log("Response Data:", data); // Log para verificar la respuesta del servidor
    setFacturas(Array.isArray(data.facturas) ? data.facturas : []);
    setMensaje(data.message || "");
  };
  const enviarRIPSfactura = async (factura) => {
    const requestBody = { ...factura, envioRips: '1' };
    const toastId = toast.loading("Enviando RIPS electrónicos...");
  
    try {
      const response = await fetch(`http://172.16.0.117/SIIS_DIME/webservices/ApiFacturasRipsElectronicos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      const data = await response.json();
      const mensaje = data.message || "Respuesta no esperada";
  
      // Verificamos si el mensaje indica un error
      const esError = mensaje.includes("contiene errores");
  
      toast.update(toastId, { 
        render: mensaje, 
        type: esError ? "error" : "success", 
        isLoading: false, 
        autoClose: 2000 
      });
  
      setMensaje(mensaje);
  
      // Si el mensaje confirma el envío exitoso, eliminamos la factura de la lista
      if (mensaje.includes(`Documento ${factura.prefijo}-${factura.factura_fiscal} de la cuenta ${factura.numerodecuenta} fue enviada correctamente.`)) {
        setFacturas(prevFacturas => prevFacturas.filter(f => 
          !(f.prefijo === factura.prefijo && f.factura_fiscal === factura.factura_fiscal && f.numerodecuenta === factura.numerodecuenta)
        ));
      }
      
    } catch (error) {
      toast.update(toastId, { 
        render: "Error al conectar con el servidor", 
        type: "error", 
        isLoading: false, 
        autoClose: 5000 
      });
    }
  };
  

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Buscar Facturas para RIPS electronicos</h2>
      <div className="row">
        <div className="col-md-3">
          <input className="form-control" type="text" placeholder="Prefijo" onChange={(e) => setFiltros({ ...filtros, prefijo: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input className="form-control" type="text" placeholder="Factura Fiscal" onChange={(e) => setFiltros({ ...filtros, factura_fiscal: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input className="form-control" type="date" onChange={(e) => setFiltros({ ...filtros, fecha_registro: e.target.value })} />
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary" onClick={buscarFacturas}>Buscar</button>
        </div>
      </div>
      {mensaje && (
        <div className="alert alert-success mt-3" role="alert">
          {mensaje} <p>Total de facturas para el dia {filtros.fecha_registro} son: {facturas.length}</p>
        </div>
      )}

      {facturas.length > 0 && (
        <table className="table mt-3">
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>Prefijo</th>
              <th style={{ textAlign: "center" }}>Factura Fiscal</th>
              <th style={{ textAlign: "center" }}>Cuenta</th>
              <th style={{ textAlign: "center" }}>Estado factura SIIS</th>
              <th style={{ textAlign: "center" }}>Total Factura</th>
              <th style={{ textAlign: "center" }}>Fecha Registro</th>
              <th style={{ textAlign: "center" }}>Estado Factura Electronica</th>
              <th style={{ textAlign: "center" }}>Estado RIPS Electronico</th>
              <th style={{ textAlign: "center" }}>JSON RIPS</th>
              <th style={{ textAlign: "center" }}>Envio rips</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => (
              <tr key={factura.factura_fiscal}>
                <td style={{ textAlign: "center" }}>{factura.prefijo}</td>
                <td style={{ textAlign: "center" }}>{factura.factura_fiscal}</td>
                <td style={{ textAlign: "center" }}>{factura.numerodecuenta}</td>
                <td style={{ textAlign: "center" }}>{factura.estado}</td>
                <td style={{ textAlign: "center" }}>{factura.total_factura}</td>
                <td style={{ textAlign: "center" }}>{factura.fecha_registro}</td>
                <td style={{ textAlign: "center" }}>{factura.estado_fac_electronica}</td>
                <td style={{ textAlign: "center" }}>{factura.estado_rips}</td>
                <td>
                  <BotonesJson jsonRespuesta={factura.json_respuesta} jsonRips={factura.json_rips} />
                </td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => enviarRIPSfactura({
                      prefijo: factura.prefijo,
                      factura_fiscal: factura.factura_fiscal,
                      numerodecuenta: factura.numerodecuenta
                    })}
                  >
                    Enviar RIPS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BuscadorFacturas;