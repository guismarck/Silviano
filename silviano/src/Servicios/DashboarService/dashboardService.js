import api from "../api/api.js";

export const obtenerResumenDashboard = async () => {
    const response = await api.get(
        "/estudiante-app/dashboard/resumen"
    );

    return response.data;
};