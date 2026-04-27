// app/api/sharepoint-import/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { Riesgo, Probabilidad, Impacto, EstadoAccion, Periodicidad, Eficacia } from '@/types/matriz';
import { calcularCriticidad } from '@/lib/formulas';

export const dynamic = 'force-dynamic';

// Configuración de SharePoint
const SHAREPOINT_SITE = 'https://sleimansa.sharepoint.com/sites/Sistemas';
const SHAREPOINT_FILE_PATH = '/Documentos compartidos/F-GC-08 Matriz de Riesgos y oportunidades v.07.xlsx';

export async function POST() {
  try {
    // 1. Descargar el archivo desde SharePoint
    const fileBuffer = await downloadFileFromSharePoint();
    
    // 2. Procesar el Excel
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(name => name.includes('Matriz')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    // 3. Convertir a nuestro formato
    const riesgos = parseExcelToRiesgos(excelData);
    
    return NextResponse.json({ success: true, data: riesgos });
    
  } catch (error: any) {
    console.error('Error importing from SharePoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error al importar desde SharePoint' 
    }, { status: 500 });
  }
}

async function downloadFileFromSharePoint(): Promise<Buffer> {
  // Usar SharePoint REST API sin autenticación (para archivos públicos o con acceso de la app)
  // Esta es una implementación básica - en producción necesitarás autenticación
  
  const fileUrl = `${SHAREPOINT_SITE}/_api/web/GetFileByServerRelativeUrl('${SHAREPOINT_FILE_PATH}')/$value`;
  
  // Método 1: Usar fetch con credenciales implícitas del navegador
  // En Next.js API route, no hay credenciales del usuario, así que usamos un enfoque alternativo
  
  // Por ahora, retornamos un error claro
  throw new Error('La descarga automática requiere configuración adicional. Usá el botón "Importar Excel" manual.');
}

function parseExcelToRiesgos(excelData: any[]): Riesgo[] {
  const riesgos: Riesgo[] = [];
  const now = new Date().toISOString();

  for (const row of excelData) {
    if (!row['Área'] && !row['Proceso']) continue;
    
    const probabilidadRaw = row['Probabilidad de que ocurra'] || 'Muy posible';
    const impactoRaw = row['Impacto que tendría si ocurre'] || 'Medio impacto';
    
    const probabilidad = ['Muy posible', 'Algo posible', 'Poco posible o improbable'].includes(probabilidadRaw) 
      ? probabilidadRaw as Probabilidad 
      : 'Muy posible';
    const impacto = ['Alto impacto', 'Medio impacto', 'Bajo impacto'].includes(impactoRaw)
      ? impactoRaw as Impacto
      : 'Medio impacto';
    
    const riesgo: Riesgo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      area: row['Área'] || 'SISTEMAS',
      proceso: row['Proceso'] || '',
      descripcion: row['Descripción del Riesgo u Oportunidad'] || '',
      consecuencia: row['Descripción de la consecuencia'] || '',
      tipo: row['Tipo: Riesgo/ Oportunidad'] === 'Oportunidad' ? 'Oportunidad' : 'Riesgo',
      probabilidad: probabilidad,
      impacto: impacto,
      criticidad: calcularCriticidad(probabilidad, impacto),
      acciones: row['Acciones'] || '',
      responsable: row['Responsable'] || '',
      recursos: row['Recursos'] || '',
      fechaComienzo: formatExcelDate(row['Fecha comienzo']),
      fechaFin: formatExcelDate(row['Fecha fin']),
      periodicidad: (row['Periodicidad de seguimiento'] as Periodicidad) || 'Anual',
      estadoAccion: (row['Estado de las acciones'] as EstadoAccion) || 'No iniciado',
      trimestre1: row['PRIMER TRIMESTRE'] === 'X',
      trimestre2: row['SEGUNDO TRIMESTRE'] === 'X',
      trimestre3: row['TERCER TRIMESTRE'] === 'X',
      trimestre4: row['CUARTO TRIMESTRE'] === 'X',
      resultadoObservado: row['Resultado observado'] || '',
      eficacia: (row['Declaración de eficacia'] as Eficacia) || 'Eficaz',
      probabilidadResidual: probabilidad,
      impactoResidual: impacto,
      criticidadResidual: calcularCriticidad(probabilidad, impacto),
      recomendacion: '',
      createdAt: now,
      updatedAt: now,
    };
    
    riesgos.push(riesgo);
  }
  
  return riesgos;
}

function formatExcelDate(excelDate: any): string {
  if (!excelDate) return '';
  if (typeof excelDate === 'string' && excelDate.match(/^\d{4}-\d{2}-\d{2}/)) {
    return excelDate.split(' ')[0];
  }
  if (typeof excelDate === 'number') {
    const date = XLSX.SSF.parse_date_code(excelDate);
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  return '';
}