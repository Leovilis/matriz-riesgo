// app/api/sharepoint-import/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { Riesgo, Probabilidad, Impacto, EstadoAccion, Periodicidad, Eficacia } from '@/types/matriz';
import { calcularCriticidad, calcularCriticidadResidual, obtenerRecomendacion } from '@/lib/formulas';

const SHAREPOINT_SITE = process.env.SHAREPOINT_SITE;
const SHAREPOINT_FILE = process.env.SHAREPOINT_FILE;

// Función para parsear Excel a Riesgos
function parseExcelToRiesgos(excelData: any[]): Riesgo[] {
  const riesgos: Riesgo[] = [];
  const now = new Date().toISOString();

  for (const row of excelData) {
    const rowAny = row as any;
    
    // Saltar filas vacías
    if (!rowAny['Área'] && !rowAny['Proceso']) continue;
    if (rowAny['Área'] === 'Área') continue;
    
    const probabilidadRaw = rowAny['Probabilidad de que ocurra'] || 'Muy posible';
    const impactoRaw = rowAny['Impacto que tendría si ocurre'] || 'Medio impacto';
    
    const probabilidad = ['Muy posible', 'Algo posible', 'Poco posible o improbable'].includes(probabilidadRaw) 
      ? probabilidadRaw as Probabilidad 
      : 'Muy posible';
    const impacto = ['Alto impacto', 'Medio impacto', 'Bajo impacto'].includes(impactoRaw)
      ? impactoRaw as Impacto
      : 'Medio impacto';
    
    const tipo = rowAny['Tipo: Riesgo/ Oportunidad'] === 'Oportunidad' ? 'Oportunidad' : 'Riesgo';
    
    const periodicidadRaw = rowAny['Periodicidad de seguimiento'] || 'Anual';
    const periodicidad = ['Mensual', 'Bimestral', 'Semestral', 'Anual', 'Según ocurrencia'].includes(periodicidadRaw)
      ? periodicidadRaw as Periodicidad
      : 'Anual';
    
    const estadoRaw = rowAny['Estado de las acciones'] || 'No iniciado';
    const estadoAccion = ['No iniciado', 'En proceso', 'Finalizado'].includes(estadoRaw)
      ? estadoRaw as EstadoAccion
      : 'No iniciado';
    
    const formatExcelDate = (excelDate: any): string => {
      if (!excelDate) return '';
      if (typeof excelDate === 'string' && excelDate.match(/^\d{4}-\d{2}-\d{2}/)) {
        return excelDate.split(' ')[0];
      }
      if (typeof excelDate === 'number') {
        const date = XLSX.SSF.parse_date_code(excelDate);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
      if (excelDate instanceof Date) {
        return excelDate.toISOString().split('T')[0];
      }
      return '';
    };
    
    const riesgo: Riesgo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      area: rowAny['Área'] || 'SISTEMAS',
      proceso: rowAny['Proceso'] || 'No especificado',
      descripcion: rowAny['Descripción del Riesgo u Oportunidad'] || 'Sin descripción',
      consecuencia: rowAny['Descripción de la consecuencia'] || 'Sin consecuencia',
      tipo: tipo,
      probabilidad: probabilidad,
      impacto: impacto,
      criticidad: calcularCriticidad(probabilidad, impacto),
      acciones: rowAny['Acciones'] || 'Sin acciones definidas',
      responsable: rowAny['Responsable'] || 'No asignado',
      recursos: rowAny['Recursos'] || 'No especificado',
      fechaComienzo: formatExcelDate(rowAny['Fecha comienzo']),
      fechaFin: formatExcelDate(rowAny['Fecha fin']),
      periodicidad: periodicidad,
      estadoAccion: estadoAccion,
      trimestre1: rowAny['PRIMER TRIMESTRE'] === 'X' || rowAny['PRIMER TRIMESTRE'] === true,
      trimestre2: rowAny['SEGUNDO TRIMESTRE'] === 'X' || rowAny['SEGUNDO TRIMESTRE'] === true,
      trimestre3: rowAny['TERCER TRIMESTRE'] === 'X' || rowAny['TERCER TRIMESTRE'] === true,
      trimestre4: rowAny['CUARTO TRIMESTRE'] === 'X' || rowAny['CUARTO TRIMESTRE'] === true,
      resultadoObservado: rowAny['Resultado observado'] || '',
      eficacia: (rowAny['Declaración de eficacia'] as Eficacia) || 'Eficaz',
      probabilidadResidual: probabilidad,
      impactoResidual: impacto,
      criticidadResidual: calcularCriticidad(probabilidad, impacto),
      recomendacion: '',
      createdAt: now,
      updatedAt: now,
    };
    
    riesgo.recomendacion = obtenerRecomendacion(riesgo.tipo, riesgo.criticidadResidual, riesgo.eficacia);
    
    riesgos.push(riesgo);
  }
  
  return riesgos;
}

async function downloadFromSharePoint(): Promise<Buffer> {
  // Placeholder - implementación pendiente con Microsoft Graph API
  // Por ahora, lanzar error indicando que se necesita configurar
  throw new Error('La descarga automática desde SharePoint requiere configuración de Microsoft Graph API');
}

export async function POST(request: Request) {
  try {
    const { force } = await request.json();
    
    // 1. Descargar el archivo desde SharePoint usando Microsoft Graph API
    let fileBuffer: Buffer;
    try {
      fileBuffer = await downloadFromSharePoint();
    } catch (error) {
      console.error('Error downloading from SharePoint:', error);
      return NextResponse.json({ 
        error: 'No se pudo descargar el archivo desde SharePoint. Verifica la configuración.' 
      }, { status: 500 });
    }
    
    // 2. Procesar el Excel
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(name => name.includes('Matriz')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    // 3. Convertir a nuestro formato
    const riesgos = parseExcelToRiesgos(excelData);
    
    return NextResponse.json({ success: true, data: riesgos });
    
  } catch (error) {
    console.error('Error importing from SharePoint:', error);
    return NextResponse.json({ error: 'Error al importar desde SharePoint' }, { status: 500 });
  }
}