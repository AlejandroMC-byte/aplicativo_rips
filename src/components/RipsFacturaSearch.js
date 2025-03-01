import { useState } from "react";
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
  const [webservices, setWebservices] = useState("sigma");
  const [showModal, setShowModal] = useState(false);
  const [cuentasModal, setCuentasModal] = useState([]);

  const buscarFacturas = async () => {
    if ((filtros.prefijo && !filtros.factura_fiscal) || (!filtros.prefijo && filtros.factura_fiscal)) {
      toast.error("Debe llenar ambos campos: Prefijo y Factura Fiscal", { position: "top-center" });
      return;
    }

    if ((filtros.prefijo && filtros.fecha_registro) || (filtros.factura_fiscal && filtros.fecha_registro) || (filtros.prefijo && filtros.factura_fiscal && filtros.fecha_registro)) {
      toast.error("Si llenas la fecha no llenes el prefijo o factura fiscal", { position: "top-center" });
      return;
    }

    const requestBody = { ...filtros, consultarFacturas: '1', webservices: webservices };
    const toastId = toast.loading("Buscando facturas...", { position: "top-center" });

    try {
      setBuscandoFacturas(true); // Bloquea el buscador

      const response = await fetch(`/api/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      // console.log("Response Data:", data); // Depuración

      setFacturas(Array.isArray(data.facturas) ? data.facturas : []);
      setMensaje(data.message || "");

      const esError = data.message?.includes("error") || !data.facturas?.length;

      toast.update(toastId, {
        render: data.message || "Facturas cargadas correctamente",
        type: esError ? "error" : "success",
        isLoading: false,
        autoClose: 2000
      });

    } catch (error) {
      console.error("Error al buscar facturas:", error);
      toast.update(toastId, {
        render: "Error al conectar con el servidor",
        type: "error",
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setBuscandoFacturas(false); // Desbloquea el buscador
    }
  };

  const enviarRIPSfactura = async (factura) => {
    const requestBody = { ...factura, envioRips: '1', webservices: webservices };
    const toastId = toast.loading("Enviando RIPS electrónicos...");

    try {
      const response = await fetch(`/api/`, {
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
            <optgroup label="Conexus" className="fw-bold text-primary">
              <option value="sigma">SIGMA</option>
              <option value="dime">DIME</option>
              <option value="fal">FAL</option>
              <option value="cya">CYA</option>
            </optgroup>
            <optgroup label="Dataico" className="fw-bold text-danger">
              <option value="posmedica">POSMÉDICA</option>
              <option value="ucimed">UCIMED</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3">
          <input className="form-control" type="text" placeholder="Prefijo" value={filtros.prefijo} onChange={(e) => setFiltros({ ...filtros, prefijo: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input className="form-control" type="text" placeholder="Factura Fiscal" value={filtros.factura_fiscal} onChange={(e) => setFiltros({ ...filtros, factura_fiscal: e.target.value })} />
        </div>
        <div className="col-md-3">
          <input className="form-control" type="date" value={filtros.fecha_registro} onChange={(e) => setFiltros({ ...filtros, fecha_registro: e.target.value })} />
        </div>
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
                    <BotonesJson jsonRespuesta={factura.json_respuesta} prefijo={factura.prefijo} facturaFiscal={factura.factura_fiscal} />
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