import { useState, useEffect, useCallback } from "react";
import BotonesJson from "./BotonesJson";
import ModalCuentas from "./ModalCuentas";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function BuscadorFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [filtros, setFiltros] = useState({ prefijo: "", factura_fiscal: "", fecha_registro: "" });
  const [mensaje, setMensaje] = useState("");
  const [buscandoFacturas, setBuscandoFacturas] = useState(false);
  const [enviandopagina, setEnviandopagina] = useState(false);
  const [webservices, setWebservices] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [cuentasModal, setCuentasModal] = useState([]);
  const [prefijos, setPrefijos] = useState([]);
  const [terceros, setTerceros] = useState([]);
  // const webservicesArray = {
  //   "SIIS_FAL": "https://siis.fundacional.org:8443/SIIS_FAL/webservices/ApiFacturasRipsElectronicos/",
  //   "SIIS_DIME": "http://172.16.0.117/SIIS_DIME/webservices/ApiFacturasRipsElectronicos/",
  //   "SIIS_SIGMA": "https://siis04.simde.com.co/SIIS_SIGMA/webservices/ApiFacturasRipsElectronicos/",
  //   "SIIS_CYA": "https://siis05.simde.com.co/SIIS_CYA/webservices/ApiFacturasRipsElectronicos/",
  //   "SIIS_UCIMED": "https://siis04.simde.com.co/SIIS_UCIMED/webservices/ApiFacturasRipsElectronicos/",
  //   "SIIS_POSMEDICA": "https://siis04.simde.com.co/SIIS_POSMEDICA/webservices/ApiFacturasRipsElectronicos/"
  // };
  const enviarRips = "https://devel82els.simde.com.co/facturacionElectronica/public/api/enviarRips";
  const consultarPrefijosFacturacion = "https://devel82els.simde.com.co/facturacionElectronica/public/api/consultarPrefijosFacturacion";
  const consultarTercerosPlanes = "https://devel82els.simde.com.co/facturacionElectronica/public/api/consultarTercerosPlanes";
  const obtenerFacturasRips = "https://devel82els.simde.com.co/facturacionElectronica/public/api/obtenerFacturasRips";
  const buscarFacturas = useCallback(async () => {
    const requestBody = { ...filtros, consultarFacturas: '1', proyecto: webservices };
    try {
      setBuscandoFacturas(true);
      const response = await fetch(obtenerFacturasRips, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: "manual",
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      // Actualiza las facturas y el mensaje
      setFacturas(Array.isArray(data) ? data : []);
      setMensaje(`Se encontraron ${data.length || 0} facturas para el día.`);
    } catch (error) {
      console.error("Error al buscar facturas:", error);
    } finally {
      setBuscandoFacturas(false);
    }
  }, [filtros, webservices]);

  const obtenerPrefijos = useCallback(async () => {
    const requestBody = { proyecto: webservices };
    try {
      const response = await fetch(consultarPrefijosFacturacion, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      setPrefijos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener prefijos:", error);
    }
  }, [webservices]);

  const obtenerTerceros = useCallback(async () => {
    const requestBody = { proyecto: webservices };
    try {
      const response = await fetch(consultarTercerosPlanes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        redirect: "manual",
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      setTerceros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener terceros:", error);
    }
  }, [webservices]);

  useEffect(() => {
    if (webservices !== "") {
      buscarFacturas();
      obtenerPrefijos();
      obtenerTerceros();
    }
  }, [webservices,obtenerPrefijos, obtenerTerceros]);

  const enviarRIPSfactura = async (factura) => {
    const requestBody = { ...factura, envioRips: '1', proyecto: webservices };
    const toastId = toast.loading("Enviando RIPS electrónicos...");
    try {
      const response = await fetch(enviarRips, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: "manual",
        body: JSON.stringify(requestBody)
      });

      // Obtener la respuesta como texto
      const responseText = await response.text();

      let data;
      try {
        // Intentar analizar el JSON
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.warn("La respuesta no es un JSON válido. Procesando como texto.");
        data = { message: responseText }; // Manejar como texto si no es JSON válido
      }

      const mensaje = data.message || "Respuesta no esperada";

      // Verificar si el mensaje indica un error
      const esError = mensaje.toLowerCase().includes("error") || mensaje.toLowerCase().includes("rechazado");
      toast.update(toastId, {
        render: mensaje,
        type: esError ? "error" : "success",
        isLoading: false,
        autoClose: 5000
      });

      setMensaje(mensaje);

      // Si el mensaje confirma el envío exitoso, eliminamos la factura de la lista
      if (mensaje.toLowerCase().includes("enviada correctamente")) {
        setFacturas((prevFacturas) =>
          prevFacturas.filter(
            (f) =>
              !(
                f.prefijo === factura.prefijo &&
                f.factura_fiscal === factura.factura_fiscal &&
                f.numerodecuenta === factura.numerodecuenta
              )
          )
        );
      }

      // Manejar el contenido de `json_respuesta` si está presente
      if (data.json_respuesta) {
        console.log("Detalles de la respuesta:", data.json_respuesta);
        // Aquí puedes procesar `json_respuesta` según tus necesidades
      }
    } catch (error) {
      console.error("Error al enviar RIPS:", error);
      toast.update(toastId, {
        render: "Error al conectar con el servidor o procesar la respuesta.",
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    }
  };

  const envioFacturasPagina = async () => {
    setEnviandopagina(true); // Bloquea el buscador
    const toastId = toast.loading("Enviando todas las facturas...", { position: "top-center" });
    try {
      for (const factura of facturas) {
        await enviarRIPSfactura(factura);
      }
      toast.update(toastId, {
        render: "Todas las facturas han sido enviadas correctamente",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });
    } catch (error) {
      toast.update(toastId, {
        render: "Error al enviar las facturas",
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setEnviandopagina(false); // Desbloquea el buscador
    }
  };

  const limpiarFormulario = () => {
    setFiltros({ prefijo: "", factura_fiscal: "", fecha_registro: "" });
    setMensaje("");
    setFacturas([]);
  };

  const formatearComoPesos = (valor) => {
    // Convertir el valor a número
    const numero = Number(valor);

    // Si el valor es inválido, devolver "$ 0"
    if (isNaN(numero)) return "$ 0";

    // Formatear correctamente
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(numero);
  };

  const handleShowModal = (cuentas) => {
    setCuentasModal(cuentas.split(','));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCuentasModal([]);
  };
  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="mb-3">Buscar Facturas para RIPS electronicos</h2>
      <div className="row">
        <div className="col-md-3">
          <select className="form-control form-select form-select-lg mb-3" onChange={(e) => setWebservices(e.target.value)}>
              <option value="">--SELECCIONE--</option>
            <optgroup label="Conexus" className="fw-bold text-primary">
              <option value="SIIS_CEO">CEO</option>
              <option value="SIIS_CYA">CYA</option>
              <option value="SIIS_FAL">FAL</option>
              <option value="SIIS_OFTACARTAGO">OFTA CARTAGO</option>
              <option value="SIIS_OFTAPALMIRA">OFTA PALMIRA</option>
              <option value="SIIS_PINARES">PINARES</option>
              <option value="SIIS_SIGMA">SIGMA</option>
              {/* <option value="dime">DIME</option> */}
            </optgroup>
            <optgroup label="Dataico" className="fw-bold text-danger">
              <option value="SIIS_ENDOCIRUJANOS">ENDOCIRUJANOS</option>
              <option value="SIIS_ANDES">LOS ANDES</option>
              <option value="SIIS_OFQUINDIO">OFTA QUINDIO</option>
              <option value="SIIS_VISION">OFTA VISION CALI</option>
              <option value="SIIS_POSMEDICA">POSMÉDICA</option>
              <option value="SIIS_SANDIEGO">SANDIEGO</option>
              <option value="SIIS_UCIMED">UCIMED</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3">
          <label className="form-label"></label>
          <select className="form-control" value={filtros.prefijo} onChange={(e) => setFiltros({ ...filtros, prefijo: e.target.value })}>
            <option value="">Seleccione Prefijo</option>
            {
              prefijos.map((item) => (
                <option key={item.prefijo} value={item.prefijo}>{item.prefijo}</option>
              ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label"></label>
          <input className="form-control" type="text" placeholder="Factura Fiscal" value={filtros.factura_fiscal} onChange={(e) => setFiltros({ ...filtros, factura_fiscal: e.target.value })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Fecha Inicio</label>
          <input className="form-control" type="date" value={filtros.fecha_inicio} onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Fecha Fin</label>
          <input className="form-control" type="date" value={filtros.fecha_fin} onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })} />
        </div>
        <div className="col-md-3">
          <select className="form-control" value={filtros.tercero} onChange={(e) => setFiltros({ ...filtros, tercero: e.target.value })}>
            <option value="">Seleccione Tercero</option>
            {terceros.map((tercero) => (
              <option key={tercero.tercero_id} value={`${tercero.tipo_id_tercero}-${tercero.tercero_id}`}>
                {tercero.nombre_tercero}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-3 d-flex">
          <button className="btn btn-primary me-2" onClick={buscarFacturas} disabled={buscandoFacturas}>
            {buscandoFacturas ? "Buscando..." : "Buscar Facturas"}
          </button>
          <button className="btn btn-secondary" onClick={limpiarFormulario} disabled={buscandoFacturas}>
            Limpiar
          </button>
        </div>
      </div>
      {mensaje && (
        <div className="alert alert-success mt-3" role="alert">
          {mensaje} <p>Total de facturas para el dia {filtros.fecha_registro} son: {facturas.length}</p>
        </div>
      )}

      {facturas.length > 0 && (
        <>
          <div className="col-md-3">
            <button className="btn btn-primary" onClick={envioFacturasPagina} disabled={enviandopagina}>
              {enviandopagina ? "Enviando Facturas pagina..." : "Enviar facturas del dia"}
            </button>
          </div>
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
                  <td style={{ textAlign: "center" }}>
                    {factura.numerodecuenta.split(',').length > 1 ? (
                      <button className="btn btn-primary" onClick={() => handleShowModal(factura.numerodecuenta)}>
                        Ver Cuentas
                      </button>
                    ) : (
                      factura.numerodecuenta
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{factura.estado}</td>
                  <td style={{ textAlign: "center" }}>
                    {formatearComoPesos(factura.total_factura)}
                  </td>
                  <td style={{ textAlign: "center" }}>{factura.fecha_registro}</td>
                  <td style={{ textAlign: "center" }}>{factura.estado_fac_electronica}</td>
                  <td style={{ textAlign: "center" }}>{factura.estado_rips}</td>
                  <td>
                    <BotonesJson webservices={webservices} prefijo={factura.prefijo} facturaFiscal={factura.factura_fiscal} />
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
        </>
      )}
      <ModalCuentas show={showModal} handleClose={handleCloseModal} cuentas={cuentasModal} />
    </div>
  );
}

export default BuscadorFacturas;