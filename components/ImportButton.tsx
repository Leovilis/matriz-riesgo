// components/ImportButton.tsx
"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Riesgo,
  Probabilidad,
  Impacto,
  EstadoAccion,
  Periodicidad,
  Eficacia,
} from "@/types/matriz";
import {
  calcularCriticidad,
  calcularCriticidadResidual,
  obtenerRecomendacion,
} from "@/lib/formulas";

interface ImportButtonProps {
  onImport: (data: Riesgo[]) => void;
}

export function ImportButton({ onImport }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);

  const formatExcelDate = (excelDate: any): string => {
    if (!excelDate) return "";

    if (typeof excelDate === "string") {
      if (excelDate.match(/^\d{4}-\d{2}-\d{2}/)) {
        return excelDate.split(" ")[0];
      }
      const parts = excelDate.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }

    if (typeof excelDate === "number") {
      const date = XLSX.SSF.parse_date_code(excelDate);
      return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    }

    if (excelDate instanceof Date) {
      return excelDate.toISOString().split("T")[0];
    }

    return "";
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      const sheetName =
        workbook.SheetNames.find((name) => name.includes("Matriz")) ||
        workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON sin header automático para poder encontrar la fila correcta
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      console.log("Filas del Excel:", rawData.length);

      // Encontrar la fila que contiene los encabezados (fila 11 aproximadamente)
      let headerRowIndex = -1;
      let dataStartIndex = -1;

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (row && row[0] === "Área" && row[1] === "Proceso") {
          headerRowIndex = i;
          dataStartIndex = i + 1;
          break;
        }
      }

      if (headerRowIndex === -1) {
        alert(
          'No se encontró la fila de encabezados. Verifica que el Excel tenga las columnas "Área" y "Proceso"',
        );
        setIsImporting(false);
        return;
      }

      // Obtener los encabezados
      const headers = rawData[headerRowIndex];
      console.log("Encabezados encontrados:", headers);

      // Obtener los datos
      const dataRows = rawData.slice(dataStartIndex);
      console.log("Filas de datos:", dataRows.length);

      const riesgos: Riesgo[] = [];
      const now = new Date().toISOString();

      for (const row of dataRows) {
        // Saltar filas vacías
        if (!row || row.length === 0) continue;
        if (!row[0] && !row[1]) continue;

        // Crear objeto con los encabezados
        const rowData: any = {};
        headers.forEach((header: string, index: number) => {
          if (header) {
            rowData[header.trim()] = row[index];
          }
        });

        const probabilidadRaw =
          rowData["Probabilidad de que ocurra"] || "Muy posible";
        const impactoRaw =
          rowData["Impacto que tendría si ocurre"] || "Medio impacto";

        const probabilidad = [
          "Muy posible",
          "Algo posible",
          "Poco posible o improbable",
        ].includes(probabilidadRaw)
          ? (probabilidadRaw as Probabilidad)
          : "Muy posible";
        const impacto = [
          "Alto impacto",
          "Medio impacto",
          "Bajo impacto",
        ].includes(impactoRaw)
          ? (impactoRaw as Impacto)
          : "Medio impacto";

        const tipo =
          rowData["Tipo: Riesgo/ Oportunidad"] === "Oportunidad"
            ? "Oportunidad"
            : "Riesgo";

        const periodicidadRaw =
          rowData["Periodicidad de seguimiento"] || "Anual";
        const periodicidad = [
          "Mensual",
          "Bimestral",
          "Semestral",
          "Anual",
          "Según ocurrencia",
        ].includes(periodicidadRaw)
          ? (periodicidadRaw as Periodicidad)
          : "Anual";

        const estadoRaw = rowData["Estado de las acciones"] || "No iniciado";
        const estadoAccion = [
          "No iniciado",
          "En proceso",
          "Finalizado",
        ].includes(estadoRaw)
          ? (estadoRaw as EstadoAccion)
          : "No iniciado";

        const eficaciaRaw = rowData["Declaración de eficacia"] || "Eficaz";
        const eficacia = [
          "Eficaz",
          "Parcialmente eficaz",
          "No eficaz",
        ].includes(eficaciaRaw)
          ? (eficaciaRaw as Eficacia)
          : "Eficaz";

        const probabilidadResidualRaw =
          rowData["Probabilidad de que ocurra2"] || probabilidad;
        const impactoResidualRaw =
          rowData["Impacto que tendría si ocurre2"] || impacto;

        const probabilidadResidual = [
          "Muy posible",
          "Algo posible",
          "Poco posible o improbable",
        ].includes(probabilidadResidualRaw)
          ? (probabilidadResidualRaw as Probabilidad)
          : probabilidad;
        const impactoResidual = [
          "Alto impacto",
          "Medio impacto",
          "Bajo impacto",
        ].includes(impactoResidualRaw)
          ? (impactoResidualRaw as Impacto)
          : impacto;

        const criticidad = calcularCriticidad(probabilidad, impacto);
        const criticidadResidual = calcularCriticidadResidual(
          probabilidadResidual,
          impactoResidual,
        );
        const recomendacion = obtenerRecomendacion(
          tipo,
          criticidadResidual,
          eficacia,
        );

        const riesgo: Riesgo = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          area: rowData["Área"] || "SISTEMAS",
          proceso: rowData["Proceso"] || "No especificado",
          descripcion:
            rowData["Descripción del Riesgo u Oportunidad"] ||
            "Sin descripción",
          consecuencia:
            rowData["Descripción de la consecuencia"] || "Sin consecuencia",
          tipo: tipo,
          probabilidad: probabilidad,
          impacto: impacto,
          criticidad: criticidad,
          acciones: rowData["Acciones"] || "Sin acciones definidas",
          responsable: rowData["Responsable"] || "No asignado",
          recursos: rowData["Recursos"] || "No especificado",
          fechaComienzo: formatExcelDate(rowData["Fecha comienzo"]),
          fechaFin: formatExcelDate(rowData["Fecha fin"]),
          periodicidad: periodicidad,
          estadoAccion: estadoAccion,
          trimestre1:
            rowData["PRIMER TRIMESTRE"] === "X" ||
            rowData["PRIMER TRIMESTRE"] === true,
          trimestre2:
            rowData["SEGUNDO TRIMESTRE"] === "X" ||
            rowData["SEGUNDO TRIMESTRE"] === true,
          trimestre3:
            rowData["TERCER TRIMESTRE"] === "X" ||
            rowData["TERCER TRIMESTRE"] === true,
          trimestre4:
            rowData["CUARTO TRIMESTRE"] === "X" ||
            rowData["CUARTO TRIMESTRE"] === true,
          resultadoObservado: rowData["Resultado observado"] || "",
          eficacia: eficacia,
          probabilidadResidual: probabilidadResidual,
          impactoResidual: impactoResidual,
          criticidadResidual: criticidadResidual,
          recomendacion: recomendacion,
          createdAt: now,
          updatedAt: now,
        };

        riesgos.push(riesgo);
      }

      console.log("Registros importados:", riesgos.length);

      if (riesgos.length > 0) {
        onImport(riesgos);
        alert(`Se importaron ${riesgos.length} registros correctamente`);
      } else {
        alert("No se encontraron registros para importar.");
      }
    } catch (error) {
      console.error("Error al importar:", error);
      alert("Error al importar el archivo. Verifica el formato.");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
      <Upload className="h-4 w-4" />
      {isImporting ? "Importando..." : "Importar Excel"}
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleImport}
        disabled={isImporting}
        className="hidden"
      />
    </label>
  );
}
