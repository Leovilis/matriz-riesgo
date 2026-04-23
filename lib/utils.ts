// lib/utils.ts
export function getCriticidadColor(criticidad: string): string {
  switch (criticidad) {
    case "Alta":
      return "bg-red-100 text-red-700";
    case "Media":
      return "bg-yellow-100 text-yellow-700";
    case "Baja":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function getEstadoColor(estado: string): string {
  switch (estado) {
    case "No iniciado":
      return "bg-gray-100 text-gray-700";
    case "En proceso":
      return "bg-blue-100 text-blue-700";
    case "Finalizado":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
export function formatDate(dateString: string): string {
  let year: number, month: number, day: number;

  // Si viene con timestamp "2026-03-18 00:00:00"
  if (dateString.includes(" ")) {
    const datePart = dateString.split(" ")[0];
    [year, month, day] = datePart.split("-").map(Number);
  } else {
    [year, month, day] = dateString.split("-").map(Number);
  }

  const formattedDay = String(day).padStart(2, "0");
  const formattedMonth = String(month).padStart(2, "0");
  return `${formattedDay}-${formattedMonth}-${year}`;
}
