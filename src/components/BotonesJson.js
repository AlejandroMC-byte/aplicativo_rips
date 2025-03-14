import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const BotonesJson = ({ prefijo, facturaFiscal, webservices }) => {
  const [show, setShow] = useState(false);
  const [jsonActual, setJsonActual] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [jsonRips, setJsonRips] = useState(null);
  const [jsonRespuesta, setJsonRespuesta] = useState(null);
  const webservicesArray = {
    "dime":"http://172.16.0.117/SIIS_DIME/webservices/ApiFacturasRipsElectronicos/"
  }
  const handleClose = () => setShow(false);
  const handleShow = async (json, title, isRips) => {
    if (isRips) {
      try {
        const requestBody = {
          consultarJsonRIPSFactura: "1",
          prefijo: prefijo,
          factura_fiscal: facturaFiscal,
          webservices: webservices
        };
        const response = await fetch(webservicesArray[webservices], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        // console.log(data.json_rips);
        setJsonRips(typeof data.json_rips === "string" ? JSON.parse(data.json_rips) : data.json_rips);
        setJsonRespuesta(typeof data.json_respuesta === "string" ? JSON.parse(data.json_respuesta) : data.json_respuesta);
      } catch (e) {
        console.error("Error al obtener JSON RIPS:", e);
        setJsonRips({ error: "Error al obtener JSON RIPS" });
        setJsonRespuesta({ error: "Error al obtener JSON Respuesta" });
      }
    } else {
      try {
        setJsonActual(typeof json === "string" ? JSON.parse(json) : json);
      } catch (e) {
        setJsonActual(json); // Si falla, deja el JSON como está
      }
    }
    setTitulo(title);
    setShow(true);
  };

  // Función para descargar JSON
  const descargarJSON = async () => {
    try {
      const requestBody = {
        consultarJsonRIPSFactura: "1",
        prefijo: prefijo,
        factura_fiscal: facturaFiscal,
        webservices: webservices

      };
      const response = await fetch(webservicesArray[webservices], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      let data = await response.json();
      // console.log(data)
      data.json_rips = typeof data.json_rips === "string" ? JSON.parse(data.json_rips) : data.json_rips;
      const blob = new Blob([JSON.stringify(data.json_rips, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `rips${prefijo}-${facturaFiscal}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error al descargar JSON RIPS:", e);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => handleShow(null, "JSON Respuesta", true)}>
          Ver JSON Respuesta
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleShow(null, "JSON RIPS", true)}>
          Ver JSON RIPS
        </Button>
        <Button variant="secondary" size="sm" onClick={descargarJSON}>
          Descargar JSON RIPS
        </Button>
      </div>
      {/* Modal */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre className="bg-light p-3">
            {titulo === "JSON RIPS" ? (jsonRips ? JSON.stringify(jsonRips, null, 2) : "Cargando...") : (jsonRespuesta ? JSON.stringify(jsonRespuesta, null, 2) : "Cargando...")}
          </pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BotonesJson;