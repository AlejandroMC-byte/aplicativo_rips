import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const BotonesJson = ({ jsonRespuesta, jsonRips }) => {
  const [show, setShow] = useState(false);
  const [jsonActual, setJsonActual] = useState(null);
  const [titulo, setTitulo] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = (json, title) => {
    try {
      setJsonActual(typeof json === "string" ? JSON.parse(json) : json);
    } catch (e) {
      setJsonActual(json); // Si falla, deja el JSON como está
    }
    setTitulo(title);
    setShow(true);
  };

  // Función para descargar JSON
  const descargarJSON = () => {
    const blob = new Blob([JSON.stringify(jsonRips, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rips.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Button variant="secondary" size="sm" className="me-2" onClick={() => handleShow(jsonRespuesta, "JSON Respuesta")}>
        Ver JSON Respuesta
      </Button>
      <Button variant="secondary" size="sm" className="me-2" onClick={() => handleShow(jsonRips, "JSON RIPS")}>
        Ver JSON RIPS
      </Button>
      <Button variant="secondary" size="sm" className="mt-2" onClick={descargarJSON}>
        Descargar JSON RIPS
      </Button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre className="bg-light p-3">{JSON.stringify(jsonActual, null, 2)}</pre>
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
