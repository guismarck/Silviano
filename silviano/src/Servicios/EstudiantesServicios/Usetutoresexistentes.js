import { useCallback, useEffect, useRef, useState } from 'react';

// Reutiliza tu servicio existente: GET /estudiante-app/tutores
// Ajusta la ruta si tu tutorService.js está en otra carpeta.
import { getTutores } from '../tutorService.js';
import { aTutorExistente } from '../../Util/validaciones/TutorExistente.js';

/**
 * Carga los tutores ya registrados para poder buscarlos y reutilizarlos.
 * Ubicación: src/Servicios/EstudiantesServicios/useTutoresExistentes.js
 *
 * Devuelve { tutores, cargando, error, recargar }.
 * Si la consulta falla, "error" trae un mensaje: el formulario usa ese dato
 * para NO permitir crear un tutor nuevo sin haber podido comprobar duplicados.
 */
export default function useTutoresExistentes() {
    const [tutores, setTutores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const montado = useRef(true);

    useEffect(() => {
        montado.current = true;
        return () => {
            montado.current = false;
        };
    }, []);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);

        try {
            const respuesta = await getTutores();

            const lista = Array.isArray(respuesta)
                ? respuesta
                : respuesta?.content ?? [];

            if (!montado.current) return;

            setTutores(lista.map(aTutorExistente).filter(Boolean));
        } catch (e) {
            console.error('No se pudo cargar la lista de tutores:', e);

            if (montado.current) {
                setTutores([]);
                setError('No se pudo consultar la lista de tutores registrados.');
            }
        } finally {
            if (montado.current) setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
    }, [cargar]);

    return { tutores, cargando, error, recargar: cargar };
}