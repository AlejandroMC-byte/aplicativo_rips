import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function ModalCuentas({ show, handleClose, cuentas }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Cuentas Relacionadas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          {cuentas.map((cuenta, index) => (
            <li key={index}>{cuenta}</li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalCuentas;