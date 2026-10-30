import api from "../api/api.js";

export const obtenerResumenDashboard = async () => {
    const response = await api.get(
        "/estudiante-app/dashboard/resumen"
    );

    return response.data;
};

// Obtener los cinco mejores promedios por nivel educativo.
// Este endpoint lo implementaremos en el backend.
export const obtenerMejoresPromedios = async (nivel) => {
    const response = await api.get(
        `/estudiante-app/dashboard/mejores-promedios/${nivel}`
    );

    return response.data;
};

// Obtener los mejores promedios de Primaria
export const obtenerMejoresPromediosPrimaria = async () => {
    const response = await api.get(
        '/estudiante-app/dashboard/mejores-promedios/primaria'
    );

    return response.data;
};

// Obtener los mejores promedios de Secundaria
export const obtenerMejoresPromediosSecundaria = async () => {
    const response = await api.get(
        '/estudiante-app/dashboard/mejores-promedios/secundaria'
    );

    return response.data;
};