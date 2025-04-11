import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const BotonesJson = ({ prefijo, facturaFiscal, webservices }) => {
  const [show, setShow] = useState(false);
  const [jsonActual, setJsonActual] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [jsonRips, setJsonRips] = useState(null);
  const [jsonRespuesta, setJsonRespuesta] = useState(null);
  const webservicesArray = {
    "fal": "https://siis.fundacional.org:8443/SIIS_FAL/webservices/ApiFacturasRipsElectronicos/",
    "dime": "http://172.16.0.117/SIIS_DIME/webservices/ApiFacturasRipsElectronicos/",
    "sigma": "https://siis04.simde.com.co/SIIS_SIGMA/webservices/ApiFacturasRipsElectronicos/",
    "cya": "https://siis05.simde.com.co/SIIS_CYA/webservices/ApiFacturasRipsElectronicos/",
    "ucimed": "https://siis04.simde.com.co/SIIS_UCIMED/webservices/ApiFacturasRipsElectronicos/",
    "posmedica": "https://siis04.simde.com.co/SIIS_POSMEDICA/webservices/ApiFacturasRipsElectronicos/"
  };
  const consultarJsonRips = "https://devel82els.simde.com.co/facturacionElectronica/public/api/consultarJsonRips";
  const handleClose = () => setShow(false);
  const handleShow = async (json, title, isRips) => {
    if (isRips) {
      try {
        const requestBody = {
          prefijo: prefijo,
          factura_fiscal: facturaFiscal,
          proyecto: webservices
        };
        const response = await fetch(consultarJsonRips, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        const data = await response.json();

        // Manejar la nueva estructura de la respuesta
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0]; // Accede al primer elemento del array
          setJsonRips(typeof firstItem.json_rips === "string" ? JSON.parse(firstItem.json_rips) : firstItem.json_rips);
          setJsonRespuesta(typeof firstItem.json_respuesta === "string" ? JSON.parse(firstItem.json_respuesta) : firstItem.json_respuesta);
        } else {
          console.error("La respuesta no contiene datos válidos.");
          setJsonRips({ error: "La respuesta no contiene datos válidos." });
          setJsonRespuesta({ error: "La respuesta no contiene datos válidos." });
        }
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
        prefijo: prefijo,
        factura_fiscal: facturaFiscal,
        proyecto: webservices
      };
      const response = await fetch(consultarJsonRips, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();

      // Manejar la nueva estructura de la respuesta
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]; // Accede al primer elemento del array
        const jsonRips = typeof firstItem.json_rips === "string" ? JSON.parse(firstItem.json_rips) : firstItem.json_rips;

        // Crear y descargar el archivo JSON
        const blob = new Blob([JSON.stringify(jsonRips, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `rips${prefijo}-${facturaFiscal}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("La respuesta no contiene datos válidos.");
      }
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