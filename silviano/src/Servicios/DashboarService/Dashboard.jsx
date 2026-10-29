
import React, { useEffect, useState, useCallback } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Button } from "primereact/button";

import DashboardCard from "./DashboardCard";
import { obtenerResumenDashboard } from "./dashboardService.js";
import "./Dashboard.css";

const resumenInicial = {
    estudiantes: 0,
    docentes: 0,
    grados: 0,
    salones: 0,
    tutores: 0,
    asignaturas: 0,
    activos: 0,
    inactivos: 0,
    matriculados: 0
};

const tarjetasGenerales = [
    {
        titulo: "Estudiantes",
        clave: "estudiantes",
        icono: "pi pi-users",
        color: "#0d9488"
    },
    {
        titulo: "Docentes",
        clave: "docentes",
        icono: "pi pi-id-card",
        color: "#2563eb"
    },
    {
        titulo: "Grados",
        clave: "grados",
        icono: "pi pi-graduation-cap",
        color: "#7c3aed"
    },
    {
        titulo: "Asignaturas",
        clave: "asignaturas",
        icono: "pi pi-book",
        color: "#ea580c"
    },
    {
        titulo: "Tutores",
        clave: "tutores",
        icono: "pi pi-user-plus",
        color: "#db2777"
    },
    {
        titulo: "Salones",
        clave: "salones",
        icono: "pi pi-building",
        color: "#0891b2"
    }
];

export default function Dashboard() {
    const [resumen, setResumen] = useState(resumenInicial);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarResumen = useCallback(async () => {
        setCargando(true);
        setError("");

        try {
            const datos = await obtenerResumenDashboard();

            setResumen({
                estudiantes: Number(datos.estudiantes ?? 0),
                docentes: Number(datos.docentes ?? 0),
                grados: Number(datos.grados ?? 0),
                salones: Number(datos.salones ?? 0),
                tutores: Number(datos.tutores ?? 0),
                asignaturas: Number(datos.asignaturas ?? 0),
                activos: Number(datos.activos ?? 0),
                inactivos: Number(datos.inactivos ?? 0),
                matriculados: Number(datos.matriculados ?? 0)
            });
        } catch (e) {
            console.error("Error al cargar el dashboard:", e);
            setError(
                "No se pudo cargar la información. " +
                "Verifica que el backend esté disponible."
            );
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarResumen();
    }, [cargarResumen]);

    const datosGrafico = {
        labels: [
            "Activos",
            "Inactivos",
            "Matriculados 2026"
        ],
        datasets: [
            {
                label: "Cantidad de estudiantes",
                data: [
                    resumen.activos,
                    resumen.inactivos,
                    resumen.matriculados
                ],
                backgroundColor: [
                    "#16A34A",
                    "#DC2626",
                    "#9333EA"
                ],
                borderRadius: 7,
                maxBarThickness: 100,
                categoryPercentage: 0.65,
                barPercentage: 0.8
            }
        ]
    };

    const opcionesGrafico = {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `${context.parsed.y} estudiantes`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                },
                title: {
                    display: true,
                    text: "Cantidad de estudiantes"
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 0,
                    minRotation: 0
                }
            }
        }
    };

    const tarjetasEstado = [
        {
            titulo: "Estudiantes activos",
            cantidad: resumen.activos,
            descripcion: "Según su estado actual",
            color: "#16A34A",
            icono: "pi pi-check-circle"
        },
        {
            titulo: "Estudiantes inactivos",
            cantidad: resumen.inactivos,
            descripcion: "Según su estado actual",
            color: "#DC2626",
            icono: "pi pi-times-circle"
        },
        {
            titulo: "Matriculados 2026",
            cantidad: resumen.matriculados,
            descripcion: "Año lectivo 2026",
            color: "#9333EA",
            icono: "pi pi-book"
        }
    ];

    return (
        <main className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Dashboard académico</h1>
                    <p>
                        Bienvenido al Sistema Académico
                        del Colegio Silviano Matamoros
                    </p>
                </div>

                <Button
                    label="Actualizar"
                    icon="pi pi-refresh"
                    outlined
                    onClick={cargarResumen}
                    disabled={cargando}
                    className="dashboard-refresh"
                />
            </header>

            {error && (
                <Message
                    severity="error"
                    text={error}
                    className="dashboard-message"
                />
            )}

            {cargando && !error ? (
                <div className="dashboard-loading">
                    <ProgressSpinner />
                    <p>Consultando información del sistema...</p>
                </div>
            ) : (
                <>
                    {/* Tarjetas generales */}
                    <section className="dashboard-section">
                        <div className="dashboard-section-heading">
                            <h2>Resumen general</h2>
                            <span>Indicadores del sistema</span>
                        </div>

                        <div className="dashboard-general-grid">
                            {tarjetasGenerales.map((tarjeta) => (
                                <DashboardCard
                                    key={tarjeta.clave}
                                    titulo={tarjeta.titulo}
                                    cantidad={resumen[tarjeta.clave]}
                                    icono={tarjeta.icono}
                                    color={tarjeta.color}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Tarjetas por estado */}
                    <section className="dashboard-section">
                        <div className="dashboard-section-heading">
                            <h2>Estado de los estudiantes</h2>
                            <span>Año lectivo 2026</span>
                        </div>

                        <div className="dashboard-status-grid">
                            {tarjetasEstado.map((tarjeta) => (
                                <Card
                                    key={tarjeta.titulo}
                                    className="dashboard-status-card"
                                >
                                    <div className="dashboard-status-content">
                                        <div className="dashboard-status-info">
                                            <p>{tarjeta.titulo}</p>

                                            <strong
                                                style={{
                                                    color: tarjeta.color
                                                }}
                                            >
                                                {tarjeta.cantidad}
                                            </strong>

                                            <span>
                                                {tarjeta.descripcion}
                                            </span>
                                        </div>

                                        <div
                                            className="dashboard-status-icon"
                                            style={{
                                                color: tarjeta.color,
                                                backgroundColor:
                                                    `${tarjeta.color}18`
                                            }}
                                        >
                                            <i className={tarjeta.icono} />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Gráfico de barras */}
                    <section className="dashboard-section">
                        <Card className="dashboard-chart-card">
                            <div className="dashboard-chart-heading">
                                <div>
                                    <h2>
                                        Comparación de estudiantes
                                    </h2>
                                    <p>
                                        Activos, inactivos y matriculados
                                        durante 2026
                                    </p>
                                </div>
                            </div>

                            <div className="dashboard-chart">
                                <Chart
                                    type="bar"
                                    data={datosGrafico}
                                    options={opcionesGrafico}
                                    style={{
                                        width: "100%",
                                        height: "100%"
                                    }}
                                />
                            </div>

                            <div className="dashboard-chart-legend">
                                {tarjetasEstado.map((item) => (
                                    <div
                                        key={item.titulo}
                                        className="dashboard-legend-item"
                                    >
                                        <span
                                            className="dashboard-legend-dot"
                                            style={{
                                                backgroundColor: item.color
                                            }}
                                        />
                                        <span>{item.titulo}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>
                </>
            )}
        </main>
    );
}
