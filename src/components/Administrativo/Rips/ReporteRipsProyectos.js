import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table, Form, Button, Spinner, Alert, Row, Col } from 'react-bootstrap'; // Importar Row y Col

// Lista de proyectos basada en las opciones proporcionadas
const PROJECTS_LIST = [
  // SIIS group (asumimos que el valor es el ID y el texto es el nombre)
  { id: 'SIIS_CEO', name: 'CEO' },
  { id: 'SIIS_CYA', name: 'CYA' },
  { id: 'SIIS_FAL', name: 'FAL' },
  { id: 'SIIS_NPMEDICAL', name: 'NPMEDICAL' },
  { id: 'SIIS_OFTACARTAGO', name: 'OFTA CARTAGO' },
  { id: 'SIIS_OFTAPALMIRA', name: 'OFTA PALMIRA' },
  { id: 'SIIS_PINARES', name: 'PINARES' },
  { id: 'SIIS_SIGMA', name: 'SIGMA' },
  // Dataico group
  { id: 'SIIS_ENDOCIRUJANOS', name: 'ENDOCIRUJANOS' },
  { id: 'SIIS_ANDES', name: 'LOS ANDES' },
  { id: 'SIIS_MAS_OPORTUNA', name: 'MAS OPORTUNA' },
  { id: 'SIIS_OFQUINDIO', name: 'OFTA QUINDIO' },
  { id: 'SIIS_VISION', name: 'OFTA VISION CALI' },
  { id: 'SIIS_OTORRINOSCALI', name: 'OTORRINOS' },
  { id: 'SIIS_POSMEDICA', name: 'POSMÉDICA' },
  { id: 'SIIS_SANE', name: 'SANE' },
  { id: 'SIIS_SANDIEGO', name: 'SANDIEGO' },
  { id: 'SIIS_SEVISALUD', name: 'SEVISALUD' },
  { id: 'SIIS_UCIMED', name: 'UCIMED' },
];

// *** REEMPLAZA ESTA URL CON TU ENDPOINT REAL ***
const SINGLE_FETCH_URL = 'https://devel82els.simde.com.co/facturacionElectronica/public/api/consultarRipsValidados'; // Ejemplo: un endpoint POST que espera { projectId: 'SIIS_CEO', fechaInicial: 'YYYY-MM-DD', fechaFinal: 'YYYY-MM-DD' }


function ReporteRipsProyectos() {
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para las fechas
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  // Cargar proyectos (usamos la lista fija aquí)
  useEffect(() => {
    setProjects(PROJECTS_LIST);
  }, []);

  // Manejar la selección de checkboxes
  const handleCheckboxChange = (projectId, isChecked) => {
    setSelectedProjects(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(projectId);
      } else {
        newSelected.delete(projectId);
      }
      return newSelected;
    });
  };

  // Manejar la selección de todos los checkboxes
  const handleSelectAllChange = (isChecked) => {
    setSelectedProjects(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        projects.forEach(project => newSelected.add(project.id));
      } else {
        newSelected.clear();
      }
      return newSelected;
    });
  };

  // Generar el archivo Excel
  const generateExcel = async () => {
    // Validar que se hayan seleccionado proyectos
    if (selectedProjects.size === 0) {
      alert('Por favor, selecciona al menos un proyecto.');
      return;
    }

    // Validar que se hayan seleccionado fechas
    if (!startDate || !endDate) {
      alert('Por favor, selecciona una fecha inicial y una fecha final.');
      return;
    }

    // Opcional: Validar que la fecha inicial no sea posterior a la final
    if (new Date(startDate) > new Date(endDate)) {
      alert('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }


    setLoading(true);
    setError(null);
    const workbook = XLSX.utils.book_new();
    let allProjectsData = []; // Array para almacenar los datos que irán en el Excel

    // Añadir información de fechas al inicio del reporte
     allProjectsData.push(['Reporte de Cantidad de Rips Validados por Proyecto y Fecha']);
    allProjectsData.push(['Fecha Inicial:', startDate]);
    allProjectsData.push(['Fecha Final:', endDate]);
    allProjectsData.push([]); // Separador

    // Añadir encabezados para las columnas de datos
     allProjectsData.push(['Proyecto', 'Cantidad Rips Validados']);
     // No añadimos fila en blanco aquí para que los datos de los proyectos sigan inmediatamente


    try {
      for (const projectId of selectedProjects) {
        const project = projects.find(p => p.id === projectId);
        if (!project) {
             // Manejar caso si el proyecto no se encuentra en la lista original (no debería pasar si la lista es fija)
             allProjectsData.push([`ID Desconocido: ${projectId}`, 'Error:', 'Proyecto no encontrado en la lista inicial.']);
             console.error(`Proyecto con ID ${projectId} no encontrado en PROJECTS_LIST.`);
             continue;
        }

        try {
          // *** FETCH A LA ÚNICA URL, ENVIANDO EL ID DEL PROYECTO Y LAS FECHAS EN EL CUERPO ***
          const response = await fetch(SINGLE_FETCH_URL, {
            method: 'POST', // O el método que use tu API
            headers: {
              'Content-Type': 'application/json',
              // Agrega otros headers si son necesarios (ej. Authorization)
            },
            body: JSON.stringify({
              proyecto: project.id,
              consultaRipsValidados: 1,
              fechaInicial: startDate, // Enviar fecha inicial
              fechaFinal: endDate      // Enviar fecha final
            }),
          });

          if (!response.ok) {
            // Si el fetch falla (ej. error 404, 500)
             allProjectsData.push([project.name, 'Error Fetch:', `Status: ${response.status}, StatusText: ${response.statusText}`]);
            console.error(`Error fetching data for project ${project.name} (${project.id}) from ${startDate} to ${endDate}: ${response.status} ${response.statusText}`);
          } else {
              const data = await response.json();
              // *** PROCESAR LA RESPUESTA Y EXTRAER LA CANTIDAD ***
              // Asumiendo que la respuesta es { message: string, cantidad: string }
              if (data && typeof data.cantidad !== 'undefined') {
                   // Añadir una fila con el Nombre del Proyecto y la Cantidad
                   allProjectsData.push([project.name, data.cantidad]);
              } else {
                   // Si la respuesta tiene un formato inesperado (no tiene 'cantidad')
                   allProjectsData.push([project.name, 'Error Datos:', 'Respuesta de API con formato inesperado (falta "cantidad").']);
                   console.error(`API response missing 'cantidad' for project ${project.name}:`, data);
              }
          }

        } catch (fetchError) {
           // Manejar errores de red u otras excepciones durante el fetch
           allProjectsData.push([project.name, 'Error Fetch:', 'Excepción: ' + fetchError.message]);
           console.error(`Workspace exception for project ${project.name} (${project.id}) from ${startDate} to ${endDate}:`, fetchError);
        }
         // No añadimos fila en blanco después de cada proyecto para una tabla continua
      }

       // Opcional: Añadir una fila en blanco al final de la tabla de datos
       // allProjectsData.push([]);


      // Crear una hoja de cálculo a partir del array de arrays
      const worksheet = XLSX.utils.aoa_to_sheet(allProjectsData);

      // Ajustar ancho de columnas (opcional, basado en contenido)
       // Ajusta estos valores (wch) según el ancho que necesites
        if (allProjectsData.length > 2) { // Asegurarse de que hay filas de datos además de encabezados y fechas
        const columnWidths = [
                { wch: 30 }, // Ancho para la columna 'Proyecto'
                { wch: 20 }  // Ancho para la columna 'Cantidad Rips Validados'
        ];
        worksheet['!cols'] = columnWidths;
      }


      // Añadir la hoja al libro de trabajo
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Cantidades'); // Nombre de la hoja

      // Generar el archivo Excel y guardarlo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      // Nombrar el archivo incluyendo las fechas seleccionadas
      saveAs(dataBlob, `Reporte_Cantidades_${startDate}_to_${endDate}.xlsx`);

    } catch (err) {
      setError('Error general al procesar los datos o generar el Excel: ' + err.message);
      console.error('General error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Determinar si el checkbox "Seleccionar Todos" debe estar marcado
  const isAllSelected = projects.length > 0 && selectedProjects.size === projects.length;
   // Determinar si el checkbox "Seleccionar Todos" debe estar en estado indeterminado
  const isIndeterminate = selectedProjects.size > 0 && selectedProjects.size < projects.length;


  return (
    <div className="container mt-4">
      <h2>Reporte de Cantidad de Rips Validados</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Campos de Fecha Inicial y Fecha Final */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="startDate">
            <Form.Label>Fecha Inicial:</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading} // Deshabilitar mientras carga
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="endDate">
            <Form.Label>Fecha Final:</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading} // Deshabilitar mientras carga
            />
          </Form.Group>
        </Col>
      </Row>


      {/* Tabla de Selección de Proyectos */}
      <Table striped bordered hover responsive className="mb-3"> {/* Added mb-3 for margin below table */}
        <thead>
          <tr>
            <th style={{ width: '50px' }}> {/* Ancho fijo para la columna de checkbox */}
              <Form.Check
                type="checkbox"
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => handleSelectAllChange(e.target.checked)}
                disabled={projects.length === 0 || loading} // Deshabilitar si carga o no hay proyectos
              />
            </th>
            <th>Nombre del Proyecto</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center">
                No hay proyectos disponibles
              </td>
            </tr>
          ) : (
            projects.map(project => (
              <tr key={project.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedProjects.has(project.id)}
                    onChange={(e) => handleCheckboxChange(project.id, e.target.checked)}
                    disabled={loading} // Deshabilitar checkboxes mientras se genera el excel
                  />
                </td>
                <td>{project.name}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Botón Generar */}
      <Button
        variant="primary"
        onClick={generateExcel}
        // Deshabilitar si no hay proyectos seleccionados, no hay fechas, o está cargando
        disabled={selectedProjects.size === 0 || !startDate || !endDate || loading}
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
            Generando Excel...
          </>
        ) : (
          'Generar Reporte Excel'
        )}
      </Button>

    </div>
  );
}

export default ReporteRipsProyectos;