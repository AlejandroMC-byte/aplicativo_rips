import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Table, Form, Button, Spinner, Alert } from 'react-bootstrap';

// Datos dummy de proyectos. En un caso real, esto vendría de una API.
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
  { id: 'SIIS_OTORRINOS', name: 'OTORRINOS' },
  { id: 'SIIS_POSMEDICA', name: 'POSMÉDICA' },
  { id: 'SIIS_SANE', name: 'SANE' },
  { id: 'SIIS_SANDIEGO', name: 'SANDIEGO' },
  { id: 'SIIS_SEVISALUD', name: 'SEVISALUD' },
  { id: 'SIIS_UCIMED', name: 'UCIMED' },
];

// *** REEMPLAZA ESTA URL CON TU ENDPOINT REAL ***
const SINGLE_FETCH_URL = '/api/fetchProjectData';

// URL base dummy para simular errores en algunos fetches
// const BASE_API_URL = 'https://jsonplaceholder.typicode.com/posts/';

function ReporteRipsProyectos() {
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar proyectos (usando datos dummy aquí)
  useEffect(() => {
    // Aquí harías un fetch real para obtener la lista de proyectos si fuera necesario
    // try {
    //   const response = await fetch('/api/projects');
    //   if (!response.ok) throw new Error('Error fetching projects');
    //   const data = await response.json();
    //   setProjects(data);
    // } catch (err) {
    //   setError(err.message);
    // }
    setProjects(PROJECTS_LIST); // Usamos datos dummy por ahora
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
    if (selectedProjects.size === 0) {
      alert('Por favor, selecciona al menos un proyecto.');
      return;
    }

    setLoading(true);
    setError(null);
    const workbook = XLSX.utils.book_new();
    let allProjectsData = []; // Array para almacenar los datos de todos los proyectos seleccionados

    // Añadir encabezados generales
    allProjectsData.push(['Nombre del Proyecto', 'Datos Obtenidos']);
    allProjectsData.push([]); // Fila en blanco para separación

    try {
      for (const projectId of selectedProjects) {
        const project = projects.find(p => p.id === projectId);
        if (!project) continue; // Saltar si el proyecto no se encuentra (debería no pasar)

        allProjectsData.push([`--- ${project.name} ---`]); // Separador por proyecto

        try {
          const response = await fetch(project.apiUrl);
          if (!response.ok) {
            // Manejar errores de fetch por proyecto
             allProjectsData.push(['Error al obtener datos:', `Status: ${response.status}, StatusText: ${response.statusText}`]);
             console.error(`Error fetching data for project ${project.name}: ${response.status} ${response.statusText}`);
             continue; // Pasar al siguiente proyecto
          }
          const data = await response.json();

          // Aquí decides cómo representar los datos en la celda.
          // Si los datos son simples, podrías ponerlos directamente.
          // Si son complejos (JSON), puedes stringificarlos o procesarlos.
          // Ejemplo simple: stringificar el JSON
          allProjectsData.push(['Datos JSON:', JSON.stringify(data, null, 2)]); // null, 2 para formato legible

          // Si los datos fueran una lista de objetos como [{campo1: v1, campo2: v2}, ...],
          // podrías procesarlos para añadirlos como filas y columnas:
          /*
          if (Array.isArray(data) && data.length > 0) {
              // Asumiendo que cada objeto tiene las mismas keys
              const headers = Object.keys(data[0]);
              allProjectsData.push(headers); // Headers para los datos del proyecto
              data.forEach(item => {
                  allProjectsData.push(headers.map(header => item[header])); // Fila de datos
              });
          } else if (typeof data === 'object' && data !== null) {
               // Si es un solo objeto
               const headers = Object.keys(data);
               allProjectsData.push(headers);
               allProjectsData.push(headers.map(header => data[header]));
          } else {
              allProjectsData.push(['Datos:', data]); // Para tipos primitivos
          }
          */


        } catch (fetchError) {
           allProjectsData.push(['Error al obtener datos:', fetchError.message]);
           console.error(`Workspace error for project ${project.name}:`, fetchError);
        }
         allProjectsData.push([]); // Fila en blanco después de cada proyecto
      }

      // Crear una hoja de cálculo a partir del array de arrays
      const worksheet = XLSX.utils.aoa_to_sheet(allProjectsData);

       // Ajustar ancho de columnas (opcional, basado en contenido)
       // Necesita un poco más de lógica para calcular el ancho apropiado
        const columnWidths = allProjectsData[0].map((header, i) => ({
            wch: Math.max(
                header.length, // Ancho mínimo basado en el header
                ...allProjectsData.slice(2) // Empezar después de los headers generales y fila en blanco
                    .filter((_, rowIndex) => allProjectsData[rowIndex + 2][i] !== undefined) // Filtrar filas donde esta columna existe
                    .map(row => String(row[i]).length || 0) // Obtener el largo de cada celda
            )
        }));

       // Ajustar un poco los anchos calculados
       if (columnWidths.length > 0) {
         columnWidths[0].wch = Math.min(Math.max(columnWidths[0].wch, 20), 60); // Nombre proyecto: min 20, max 60
       }
        if (columnWidths.length > 1) {
          columnWidths[1].wch = Math.min(Math.max(columnWidths[1].wch, 50), 150); // Datos: min 50, max 150
        }

       worksheet['!cols'] = columnWidths;


      // Añadir la hoja al libro de trabajo
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos Proyectos');

      // Generar el archivo Excel y guardarlo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(dataBlob, 'DatosProyectosSeleccionados.xlsx');

    } catch (err) {
      setError('Error general al procesar los datos o generar el Excel: ' + err.message);
      console.error('General error:', err);
    } finally {
      setLoading(false);
    }
  };

   // Determinar si el checkbox "Seleccionar Todos" debe estar marcado
   const isAllSelected = projects.length > 0 && selectedProjects.size === projects.length;
    const isIndeterminate = selectedProjects.size > 0 && selectedProjects.size < projects.length;


  return (
    <div className="container mt-4">
      <h2>Seleccionar Proyectos</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
             <th>
                 <Form.Check
                     type="checkbox"
                     checked={isAllSelected}
                     indeterminate={isIndeterminate}
                     onChange={(e) => handleSelectAllChange(e.target.checked)}
                     disabled={projects.length === 0}
                 />
             </th>
            <th>Nombre del Proyecto</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center">
                {loading ? <Spinner animation="border" size="sm" /> : 'No hay proyectos disponibles'}
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
                  />
                </td>
                <td>{project.name}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Button
        variant="primary"
        onClick={generateExcel}
        disabled={selectedProjects.size === 0 || loading}
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
            Generando Excel...
          </>
        ) : (
          'Generar Excel de Proyectos Seleccionados'
        )}
      </Button>

    </div>
  );
}

export default ReporteRipsProyectos;