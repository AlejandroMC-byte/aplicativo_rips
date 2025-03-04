import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const BotonesJson = ({ jsonRespuesta, prefijo, facturaFiscal, webservices }) => {
  const [show, setShow] = useState(false);
  const [jsonActual, setJsonActual] = useState(null);
  const [titulo, setTitulo] = useState("");

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
        const response = await fetch(`/api/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        // console.log(data);
        setJsonActual(typeof data === "string" ? JSON.parse(data) : data);
      } catch (e) {
        console.error("Error al obtener JSON RIPS:", e);
        setJsonActual({ error: "Error al obtener JSON RIPS" });
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
      const response = await fetch(`/api/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      let data = await response.json();
      data = typeof data === "string" ? JSON.parse(data) : data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
        <Button variant="secondary" size="sm" onClick={() => handleShow(jsonRespuesta, "JSON Respuesta", false)}>
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
            {jsonActual ? JSON.stringify(jsonActual, null, 2) : "Cargando..."}
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