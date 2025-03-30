import { useState, useEffect } from "react";
import BotonesJson from "../BotonesJson";
import ModalCuentas from "../ModalCuentas";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './Styles/FacturaSearch.css';
function BuscadorFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [filtros, setFiltros] = useState({ prefijo: "", factura_fiscal: "", fecha_registro: "" });
  const [mensaje, setMensaje] = useState("");
  const [buscandoFacturas, setBuscandoFacturas] = useState(false);
  const [enviandopagina, setEnviandopagina] = useState(false);
  const [webservices, setWebservices] = useState("SIIS_SIGMA");
  const [showModal, setShowModal] = useState(false);
  const [cuentasModal, setCuentasModal] = useState([]);
  const [prefijos, setPrefijos] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const obtenerFacturas = "https://devel82els.simde.com.co/facturacionElectronica/public/api/obtenerFacturas";
  const consultarPrefijosFacturacion = "https://devel82els.simde.com.co/facturacionElectronica/public/api/consultarPrefijosFacturacion";
  const consultarTercerosPlanes = "https://devel82els.simde.com.co/facturacionElectronica/public/api/consultarTercerosPlanes";
  const buscarFacturas = async () => {
    const requestBody = {
      ...filtros, proyecto: webservices
    }; // JSON de envío según la imagen
    const toastId = toast.loading("Buscando facturas del día...", { position: "top-center" });
    try {
      setBuscandoFacturas(true); // Bloquea el buscador
      const response = await fetch(obtenerFacturas, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        redirect: "manual",
        body: JSON.stringify(requestBody)
      });

      if (response.status === 301 || response.status === 302) {
        throw new Error("Redirección detectada. Verifica la URL del endpoint.");
      }

      const data = await response.json();

      // Actualiza las facturas y el mensaje
      setFacturas(Array.isArray(data) ? data : []);
      setMensaje(`Se encontraron ${data.length || 0} facturas para el día.`);

      toast.update(toastId, {
        render: `Se encontraron ${data.length || 0} facturas para el día.`,
        type: "success",
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
  const obtenerPrefijos = async () => {
    const requestBody = { proyecto: webservices };
    try {
      const response = await fetch(consultarPrefijosFacturacion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: "manual",
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      // console.log('prefijos', data);
      setPrefijos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener prefijos:", error);
    }
  };

  // Función para obtener terceros desde la API
  const obtenerTerceros = async () => {
    const requestBody = { proyecto: webservices };
    try {
      const response = await fetch(consultarTercerosPlanes, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: "manual",
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      setTerceros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener terceros:", error);
    }
  };
  useEffect(() => {
    buscarFacturas()
    // Llamar a las funciones cuando el componente se monte
    obtenerPrefijos();
    obtenerTerceros();
  }, []);


  // const enviarRIPSfactura = async (factura) => {
  //   const requestBody = { ...factura, envioRips: '1', webservices: webservices };
  //   const toastId = toast.loading("Enviando RIPS electrónicos...");

  //   try {
  //     const response = await fetch(webservicesArray[webservices], {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(requestBody)
  //     });

  //     const data = await response.json();
  //     const mensaje = data.message || "Respuesta no esperada";

  //     // Verificamos si el mensaje indica un error
  //     const esError = mensaje.includes("contiene errores");

  //     toast.update(toastId, {
  //       render: mensaje,
  //       type: esError ? "error" : "success",
  //       isLoading: false,
  //       autoClose: 2000
  //     });

  //     setMensaje(mensaje);

  //     // Si el mensaje confirma el envío exitoso, eliminamos la factura de la lista
  //     if (mensaje.includes(`Documento ${factura.prefijo}-${factura.factura_fiscal} de la cuenta ${factura.numerodecuenta} fue enviada correctamente.`)) {
  //       setFacturas(prevFacturas => prevFacturas.filter(f =>
  //         !(f.prefijo === factura.prefijo && f.factura_fiscal === factura.factura_fiscal && f.numerodecuenta === factura.numerodecuenta)
  //       ));
  //     }

  //   } catch (error) {
  //     toast.update(toastId, {
  //       render: "Error al conectar con el servidor",
  //       type: "error",
  //       isLoading: false,
  //       autoClose: 5000
  //     });
  //   }
  // };

  // const envioFacturasPagina = async () => {
  //   setEnviandopagina(true); // Bloquea el buscador
  //   const toastId = toast.loading("Enviando todas las facturas...", { position: "top-center" });
  //   try {
  //     for (const factura of facturas) {
  //       await enviarRIPSfactura(factura);
  //     }
  //     toast.update(toastId, {
  //       render: "Todas las facturas han sido enviadas correctamente",
  //       type: "success",
  //       isLoading: false,
  //       autoClose: 2000
  //     });
  //   } catch (error) {
  //     toast.update(toastId, {
  //       render: "Error al enviar las facturas",
  //       type: "error",
  //       isLoading: false,
  //       autoClose: 5000
  //     });
  //   } finally {
  //     setEnviandopagina(false); // Desbloquea el buscador
  //   }
  // };

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

  const ejecutarLink = async (factura) => {
    const { prefijo, factura_fiscal, periodo, nit, estado_fac_electronica } = factura;
    const requestBody = {
      prefijo: prefijo,
      numero: factura_fiscal,
      periodo: periodo,
      nit: nit,
      proyecto: webservices
    };
    // Verifica si el estado es "VALIDADA DIAN" o "PENDIENTE VALIDACION DIAN"
    if (estado_fac_electronica === "VALIDADA DIAN" || estado_fac_electronica === "PENDIENTE VALIDACION DIAN") {
      const url = `https://devel82els.simde.com.co/facturacionElectronica/public/api/consultarFacturaConexus?prefijo=${prefijo}&numero=${factura_fiscal}&periodo=${periodo}&nit=${nit}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: "manual",
          body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        console.log(data);

        // Verifica si el resultado contiene el campo PDFBase64
        if (data.GetTransaccionbyIdentificacionResult && data.GetTransaccionbyIdentificacionResult.PDFBase64) {
          const pdfBase64 = data.GetTransaccionbyIdentificacionResult.PDFBase64;

          // Decodifica el contenido Base64 y crea un Blob para el PDF
          const byteCharacters = atob(pdfBase64);
          const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });

          // Crea una URL para el Blob y ábrelo en una nueva ventana
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
        } else {
          toast.error("No se pudo obtener el PDF de la transacción.");
        }
      } catch (error) {
        console.error("Error al obtener el PDF:", error);
        toast.error("Error al conectar con el servidor.");
      }
    }
  };
  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="mb-3">Buscar Facturas electronicas</h2>
      <div className="row">
        <div className="col-md-3">
          <select className="form-control form-select form-select-lg mb-3" onChange={(e) => setWebservices(e.target.value)}>
            <optgroup label="Conexus" className="fw-bold text-primary">
              <option value="SIIS_SIGMA">SIGMA</option>
              <option value="SIIS_INDIGO">INDIGO</option>
              <option value="SIIS_OFTAPALMIRA">OFTA PALMIRA</option>
              <option value="SIIS_OFTACARTAGO">OFTA CARTAGO</option>
              <option value="SIIS_PINARES">PINARES</option>
              {/* <option value="SIIS_CEO">CEO</option> */}
              <option value="SIIS_FAL">FAL</option>
              <option value="SIIS_CYA">CYA</option>
            </optgroup>
            <optgroup label="Dataico" className="fw-bold text-danger">
              <option value="SIIS_POSMEDICA">POSMÉDICA</option>
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
          <input className="form-control" type="date" value={filtros.fecha_fin} onChange={(e) => setFiltros({ ...filtros, fecha_registro: e.target.value })} />
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
        <div className="col-md-3">
          <select className="form-control" value={filtros.estado_dian} onChange={(e) => setFiltros({ ...filtros, estado_dian: e.target.value })}>
            <option value="0">ERROR</option>
            <option value="1">VALIDADO DIAN</option>
            <option value="2">PENDIENTE VALIDACION DIAN</option>
            <option value="3">SIN ENVIAR</option>
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
          {/* <div className="col-md-3"> */}
          {/* <button className="btn btn-primary" onClick={envioFacturasPagina} disabled={enviandopagina}>
              {enviandopagina ? "Enviando Facturas pagina..." : "Enviar facturas del dia"}
            </button> */}
          {/* </div> */}
          <table className="table mt-3">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Prefijo</th>
                <th style={{ textAlign: "center" }}>Factura Fiscal</th>
                <th style={{ textAlign: "center" }}>Cuenta</th>
                <th style={{ textAlign: "center" }}>Fecha registro</th>
                <th style={{ textAlign: "center" }}>estado factura electronica</th>
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
                  <td style={{ textAlign: "center" }}>{factura.fecha_registro}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className={`btn estado-factura ${factura.estado_fac_electronica === "VALIDADA DIAN"
                          ? "validada"
                          : factura.estado_fac_electronica === "PENDIENTE VALIDACION DIAN"
                            ? "pendiente"
                            : "error"
                        }`}
                      onClick={() => ejecutarLink(factura)}
                      disabled={
                        factura.estado_fac_electronica !== "VALIDADA DIAN" &&
                        factura.estado_fac_electronica !== "PENDIENTE VALIDACION DIAN"
                      }
                    >
                      {factura.estado_fac_electronica}
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