// components/ExportButton.tsx
'use client';

import { Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { Riesgo } from '@/types/matriz';

interface ExportButtonProps {
  data: Riesgo[];
}

export function ExportButton({ data }: ExportButtonProps) {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Manzur Administraciones';
    
    const matrizSheet = workbook.addWorksheet('Matriz');
    
    // Configurar columnas
    matrizSheet.columns = [
      { key: 'area', width: 20 },
      { key: 'proceso', width: 30 },
      { key: 'descripcion', width: 50 },
      { key: 'consecuencia', width: 50 },
      { key: 'tipo', width: 20 },
      { key: 'probabilidad', width: 20 },
      { key: 'impacto', width: 20 },
      { key: 'criticidad', width: 12 },
      { key: 'acciones', width: 60 },
      { key: 'responsable', width: 20 },
      { key: 'recursos', width: 30 },
      { key: 'fechaComienzo', width: 15 },
      { key: 'fechaFin', width: 15 },
      { key: 'periodicidad', width: 22 },
      { key: 'estado', width: 18 },
      { key: 't1', width: 14 },
      { key: 't2', width: 14 },
      { key: 't3', width: 14 },
      { key: 't4', width: 14 },
      { key: 'resultado', width: 40 },
      { key: 'eficacia', width: 20 },
      { key: 'probabilidadResidual', width: 22 },
      { key: 'impactoResidual', width: 22 },
      { key: 'criticidadResidual', width: 18 },
      { key: 'recomendacion', width: 60 },
    ];
    
    // Altura de la fila 1 (logo)
    matrizSheet.getRow(1).height = 36;
    
    // Insertar logo en la celda A1
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onload = async (e) => {
          const imageId = workbook.addImage({
            base64: e.target?.result as string,
            extension: 'png',
          });
          
          matrizSheet.addImage(imageId, {
            tl: { col: 0, row: 0 },
            ext: { width:  137.2, height: 45 } // 3.5cm x 1.2cm aproximadamente
          });
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error al cargar el logo:', error);
      const manzurCell = matrizSheet.getCell('A1');
      manzurCell.value = 'MANZUR';
      manzurCell.font = { name: 'Calibri', size: 10, bold: true };
    }
    
    // B1:F2 combinadas y centradas
    matrizSheet.mergeCells('B1:F2');
    const tituloCell = matrizSheet.getCell('B1');
    tituloCell.value = 'MATRIZ DE RIESGOS Y OPORTUNIDADES';
    tituloCell.font = { name: 'Calibri', size: 10, bold: true };
    tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // G1:H1 combinadas
    matrizSheet.mergeCells('G1:H1');
    const versionCell = matrizSheet.getCell('G1');
    versionCell.value = 'N° VERSION: 07';
    versionCell.font = { name: 'Calibri', size: 10, bold: true };
    versionCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // G2:H2 combinadas
    matrizSheet.mergeCells('G2:H2');
    const vigenciaCell = matrizSheet.getCell('G2');
    vigenciaCell.value = 'Fecha de vigencia: 18/02/2026';
    vigenciaCell.font = { name: 'Calibri', size: 10, bold: true };
    vigenciaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // REF en A2
    const refCell = matrizSheet.getCell('A2');
    refCell.value = 'REF: F-GC-08';
    refCell.font = { name: 'Calibri', size: 10, bold: true };
    
    // Fila 3: ELABORADO, REVISADO, APROBADO
    const elaboradoLabelCell = matrizSheet.getCell('A3');
    elaboradoLabelCell.value = 'ELABORADO';
    elaboradoLabelCell.font = { name: 'Calibri', size: 9, bold: true };
    
    matrizSheet.mergeCells('B3:F3');
    const revisadoLabelCell = matrizSheet.getCell('B3');
    revisadoLabelCell.value = 'REVISADO';
    revisadoLabelCell.font = { name: 'Calibri', size: 9, bold: true };
    revisadoLabelCell.alignment = { horizontal: 'center' };
    
    matrizSheet.mergeCells('G3:H3');
    const aprobadoLabelCell = matrizSheet.getCell('G3');
    aprobadoLabelCell.value = 'APROBADO';
    aprobadoLabelCell.font = { name: 'Calibri', size: 9, bold: true };
    aprobadoLabelCell.alignment = { horizontal: 'center' };
    
    // Fila 4: Nombres
    const elaboradoCell = matrizSheet.getCell('A4');
    elaboradoCell.value = 'Analista de Calidad';
    elaboradoCell.font = { name: 'Calibri', size: 9 };
    
    matrizSheet.mergeCells('B4:F4');
    const revisadoCell = matrizSheet.getCell('B4');
    revisadoCell.value = 'Coordinador de Calidad';
    revisadoCell.font = { name: 'Calibri', size: 9 };
    revisadoCell.alignment = { horizontal: 'center' };
    
    matrizSheet.mergeCells('G4:H4');
    const aprobadoCell = matrizSheet.getCell('G4');
    aprobadoCell.value = 'Coordinador de Calidad';
    aprobadoCell.font = { name: 'Calibri', size: 9 };
    aprobadoCell.alignment = { horizontal: 'center' };
    
    // Fila 5: Documento reservado (A5:H5 combinado) - altura 20px
    matrizSheet.getRow(5).height = 20;
    matrizSheet.mergeCells('A5:H5');
    const reservadoCell = matrizSheet.getCell('A5');
    reservadoCell.value = 'Documento de carácter RESERVADO. Su contenido es de uso interno. Se prohíbe su divulgación a terceros sin autorización expresa de Manzur Administraciones';
    reservadoCell.font = { name: 'Calibri', size: 9, italic: true };
    reservadoCell.alignment = { horizontal: 'center' };
    
    // Fila 6: Fecha actualización
    matrizSheet.mergeCells('A6:C6');
    const fechaActLabelCell = matrizSheet.getCell('A6');
    fechaActLabelCell.value = 'Fecha de última actualización de la matriz:';
    fechaActLabelCell.font = { name: 'Calibri', size: 9, bold: true };
    fechaActLabelCell.alignment = { horizontal: 'left' };
    
    const fechaActCell = matrizSheet.getCell('D6');
    fechaActCell.value = '18/03/2026';
    fechaActCell.alignment = { horizontal: 'left' };
    fechaActCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }
    };
    
    // Fila 7: Espacio
    matrizSheet.mergeCells('A7:H7');
    
    // Fila 8: Título de secciones
    matrizSheet.mergeCells('A8:H8');
    const identificacionCell = matrizSheet.getCell('A8');
    identificacionCell.value = 'IDENTIFICACIÓN Y EVALUACIÓN';
    identificacionCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    identificacionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0069B3' } };
    identificacionCell.alignment = { horizontal: 'center' };
    
    matrizSheet.mergeCells('I8:N8');
    const planificacionCell = matrizSheet.getCell('I8');
    planificacionCell.value = 'PLANIFICACIÓN';
    planificacionCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    planificacionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF808080' } };
    planificacionCell.alignment = { horizontal: 'center' };
    
    matrizSheet.mergeCells('O8:S8');
    const seguimientoCell = matrizSheet.getCell('O8');
    seguimientoCell.value = 'SEGUIMIENTO';
    seguimientoCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    seguimientoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0069B3' } };
    seguimientoCell.alignment = { horizontal: 'center' };
    
    matrizSheet.mergeCells('T8:U8');
    const eficaciaLabelCell = matrizSheet.getCell('T8');
    eficaciaLabelCell.value = 'EFICACIA';
    eficaciaLabelCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    eficaciaLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8181' } };
    eficaciaLabelCell.alignment = { horizontal: 'center' };
    
    matrizSheet.mergeCells('V8:X8');
    const evaluacionCell = matrizSheet.getCell('V8');
    evaluacionCell.value = 'EVALUACIÓN DE RIESGO RESIDUAL';
    evaluacionCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    evaluacionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8181' } };
    evaluacionCell.alignment = { horizontal: 'center' };
    
    // Fila 9: Encabezados de columnas
    const headers = [
      { text: 'Área', color: 'FF0069B3' },
      { text: 'Proceso', color: 'FF0069B3' },
      { text: 'Descripción del Riesgo u Oportunidad', color: 'FF0069B3' },
      { text: 'Descripción de la consecuencia', color: 'FF0069B3' },
      { text: 'Tipo: Riesgo/ Oportunidad', color: 'FF0069B3' },
      { text: 'Probabilidad de que ocurra', color: 'FFFF8181' },
      { text: 'Impacto que tendría si ocurre', color: 'FFFF8181' },
      { text: 'Criticidad', color: 'FFFF8181' },
      { text: 'Acciones', color: 'FF808080' },
      { text: 'Responsable', color: 'FF808080' },
      { text: 'Recursos', color: 'FF808080' },
      { text: 'Fecha comienzo', color: 'FF808080' },
      { text: 'Fecha fin', color: 'FF808080' },
      { text: 'Periodicidad de seguimiento', color: 'FF808080' },
      { text: 'Estado de las acciones', color: 'FF0069B3' },
      { text: 'PRIMER TRIMESTRE', color: 'FF0069B3' },
      { text: 'SEGUNDO TRIMESTRE', color: 'FF0069B3' },
      { text: 'TERCER TRIMESTRE', color: 'FF0069B3' },
      { text: 'CUARTO TRIMESTRE', color: 'FF0069B3' },
      { text: 'Resultado observado', color: 'FFFF8181' },
      { text: 'Declaración de eficacia', color: 'FFFF8181' },
      { text: 'Probabilidad de que ocurra2', color: 'FFFF8181' },
      { text: 'Impacto que tendría si ocurre2', color: 'FFFF8181' },
      { text: 'Criticidad2', color: 'FFFF8181' },
      { text: 'Recomendación del SGC\n(mensaje automático)', color: 'FF808080' }
    ];
    
    headers.forEach((header, index) => {
      const cell = matrizSheet.getCell(9, index + 1);
      cell.value = header.text;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: header.color }
      };
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Alturas de fila
    matrizSheet.getRow(1).height = 36;
    matrizSheet.getRow(5).height = 20;
    matrizSheet.getRow(8).height = 25;
    matrizSheet.getRow(9).height = 60;
    
    // Agregar datos (comenzando desde fila 10)
    data.forEach((item, idx) => {
      const rowNum = 10 + idx;
      const row = matrizSheet.getRow(rowNum);
      
      row.getCell(1).value = item.area;
      row.getCell(2).value = item.proceso;
      row.getCell(3).value = item.descripcion;
      row.getCell(4).value = item.consecuencia;
      row.getCell(5).value = item.tipo;
      row.getCell(6).value = item.probabilidad;
      row.getCell(7).value = item.impacto;
      row.getCell(8).value = item.criticidad;
      row.getCell(9).value = item.acciones;
      row.getCell(10).value = item.responsable;
      row.getCell(11).value = item.recursos;
      row.getCell(12).value = item.fechaComienzo;
      row.getCell(13).value = item.fechaFin;
      row.getCell(14).value = item.periodicidad;
      row.getCell(15).value = item.estadoAccion;
      row.getCell(16).value = item.trimestre1 ? 'X' : '';
      row.getCell(17).value = item.trimestre2 ? 'X' : '';
      row.getCell(18).value = item.trimestre3 ? 'X' : '';
      row.getCell(19).value = item.trimestre4 ? 'X' : '';
      row.getCell(20).value = item.resultadoObservado;
      row.getCell(21).value = '';
      row.getCell(22).value = '';
      row.getCell(23).value = '';
      row.getCell(24).value = '';
      row.getCell(25).value = '';
      
      row.height = 25;
      
      for (let i = 1; i <= 25; i++) {
        const cell = row.getCell(i);
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      
      const tipoCell = row.getCell(5);
      if (item.tipo === 'Riesgo') {
        tipoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } };
        tipoCell.font = { color: { argb: 'FFCC0000' }, bold: true };
      } else if (item.tipo === 'Oportunidad') {
        tipoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } };
        tipoCell.font = { color: { argb: 'FF008000' }, bold: true };
      }
      
      const criticidadCell = row.getCell(8);
      if (item.criticidad === 'Alta') {
        criticidadCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
        criticidadCell.font = { color: { argb: 'FF8B0000' }, bold: true };
      } else if (item.criticidad === 'Media') {
        criticidadCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE68C' } };
        criticidadCell.font = { color: { argb: 'FFCC8800' }, bold: true };
      } else if (item.criticidad === 'Baja') {
        criticidadCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
        criticidadCell.font = { color: { argb: 'FF008800' }, bold: true };
      }
    });
    
    matrizSheet.views = [];
    
    if (data.length > 0) {
      matrizSheet.autoFilter = {
        from: 'A9',
        to: 'X' + (9 + data.length)
      };
    }
    
    // ========== HOJA REFERENCIAS ==========
    const referenciasSheet = workbook.addWorksheet('Referencias');
    
    const referenciasData = [
      ['PROBABILIDAD', 'MUY POSIBLE', 'Medio', 'Alto', 'Alto'],
      ['', 'ALGO POSIBLE', 'Baja', 'Medio', 'Alto'],
      ['', 'POCO POSIBLE O IMPROBABLE', 'Baja', 'Baja', 'Medio'],
      ['', '', 'BAJO IMPACTO', 'MEDIO IMPACTO', 'ALTO IMPACTO'],
      ['', '', 'IMPACTO', '', ''],
      [],
      ['Referencias:', '', '', '', ''],
      ['Probabilidad', 'Muy posible', 'Es probable que ocurra y puede repetirse varias veces en el año.', '', ''],
      ['Probabilidad', 'Algo posible', 'Puede ocurrir en el desarrollo habitual del proceso, aunque no es frecuente.', '', ''],
      ['Probabilidad', 'Poco posible o improbable', 'Ocurre de manera excepcional. No se espera en condiciones normales.', '', ''],
      ['Impacto', 'Alto impacto', 'Efecto significativo con consecuencias relevantes para el proceso o los objetivos del proceso.', '', ''],
      ['Impacto', 'Medio impacto', 'Efecto apreciable, requiere atención o ajustes.', '', ''],
      ['Impacto', 'Bajo impacto', 'Efecto menor, poco perceptible en el desempeño del proceso.', '', ''],
      ['Criticidad', 'Alta', 'Requiere acciones formales y seguimiento frecuente. El compromiso del equipo es clave para su gestión efectiva.', '', ''],
      ['Criticidad', 'Baja', 'Se podrán definir acciones cuando el equipo considere que su gestión agrega valor al proceso.', '', ''],
      ['Criticidad', 'Media', 'Requiere definición de acciones y seguimiento planificado.', '', ''],
      [],
      ['Probabilidad', 'Impacto', 'Criticidad', '', ''],
      ['Poco posible o improbable', 'Bajo impacto', 'Baja', '', ''],
      ['Algo posible', 'Bajo impacto', 'Baja', '', ''],
      ['Muy posible', 'Bajo impacto', 'Media', '', ''],
      ['Poco posible o improbable', 'Medio impacto', 'Baja', '', ''],
      ['Algo posible', 'Medio impacto', 'Media', '', ''],
      ['Muy posible', 'Medio impacto', 'Alta', '', ''],
      ['Poco posible o improbable', 'Alto impacto', 'Media', '', ''],
      ['Algo posible', 'Alto impacto', 'Alta', '', ''],
      ['Muy posible', 'Alto impacto', 'Alta', '', ''],
      ['N/A', 'N/A', 'N/A', '', ''],
      [],
      ['Áreas', '', '', '', ''],
      ['AUDITORÍA INTERNA', '', '', '', ''],
      ['AUDITORÍA PROD Y SERV', '', '', '', ''],
      ['COMPRAS', '', '', '', ''],
      ['CONTABLE', '', '', '', ''],
      ['CONTROL DE GESTIÓN', '', '', '', ''],
      ['DATA ANALYTICS', '', '', '', ''],
      ['FINANZAS', '', '', '', ''],
      ['GESTIÓN DE CALIDAD', '', '', '', ''],
      ['IMPUESTOS', '', '', '', ''],
      ['PLANIFICACIÓN ESTRATÉGICA', '', '', '', ''],
      ['RRHH HARD', '', '', '', ''],
      ['RRHH SOFT', '', '', '', ''],
      ['RSE', '', '', '', ''],
      ['SISTEMAS', '', '', '', ''],
      [],
      ['Criticidad', 'Recomendación', '', '', ''],
      ['Baja', 'El riesgo residual es bajo. Si cree que conviene seguir controlándolo, genere una nueva fila y mantenga acciones.', '', '', ''],
      ['Media', 'Es importante trabajar en reducir o controlar este riesgo residual. Debe generar una nueva fila con este riesgo y definir nuevas acciones para reducirlo o controlarlo.', '', '', ''],
      ['Alta', 'El riesgo residual es alarmante. Debe generar una nueva fila y definir nuevas acciones de manera obligatoria para reducirlo o controlarlo.', '', '', ''],
      ['No eficaz', 'La oportunidad no dió los resultados esperados, pregúntese si sigue siendo importante para la organización. Si la respuesta es sí, genere una nueva fila y proponga nuevas acciones.', '', '', ''],
    ];
    
    referenciasData.forEach((rowData) => {
      const row = referenciasSheet.addRow(rowData);
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });
    
    referenciasSheet.getColumn(1).width = 25;
    referenciasSheet.getColumn(2).width = 25;
    referenciasSheet.getColumn(3).width = 80;
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'F-GC-08 Matriz de Riesgos y oportunidades v.07.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <Download className="h-4 w-4" />
      Exportar Excel con formato
    </button>
  );
}