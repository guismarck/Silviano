
import React from "react";
import { Card } from "primereact/card";

export default function DashboardCard({
    titulo,
    cantidad,
    icono,
    color
}) {
    return (
        <Card className="dashboard-status-card">
            <div className="dashboard-status-content">
                <div className="dashboard-status-info">
                    <p>{titulo}</p>

                    <strong style={{ color }}>
                        {cantidad}
                    </strong>
                </div>

                <div
                    className="dashboard-status-icon"
                    style={{
                        color,
                        backgroundColor: `${color}18`
                    }}
                >
                    <i className={icono} />
                </div>
            </div>
        </Card>
    );
}
