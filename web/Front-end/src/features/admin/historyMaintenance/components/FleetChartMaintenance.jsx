import { useTranslation } from "react-i18next";
import { Pie, PieChart, Cell, Tooltip } from "recharts";// Importar los componentes necesarios de Recharts para crear el gráfico circular
import style from "./FleetChartMaintenance.module.css";
function FleetChartMaintenance({ records }) {
    const { t } = useTranslation();
    // Llave i18n -> código de estado de fleet-maintenance
    const stateMap = {
        pending: "SCHEDULED",
        inProgress: "IN_PROGRESS",
        completed: "COMPLETED",
        cancel: "CANCELLED",
    };
    const COLORS = {
        pending: "#F59E0B",
        inProgress: "#8B5CF6",
        completed: "#22C55E",
        cancel: "#EF4444",
    };
    const desiredOrder = ["pending", "inProgress", "completed", "cancel"];
    const data = desiredOrder.map((stateKey) => ({
        name: stateKey,
        value: records.filter((v) => v.status === stateMap[stateKey]).length,
    }));

    const total = records.length;
    return (
        <div className={style["fleet-chart-container"]}>
            <h3>{t("History.title2")}</h3>

            <div className={style["fleet-chart-body"]}>
                <div className={style["fleet-chart"]}>
                    <PieChart width={140} height={140}>
                        <Pie data={data} cx={70} cy={70} innerRadius={40} outerRadius={62} dataKey="value">{
                            data.map((entry) => (
                                <Cell key={entry.name} fill={COLORS[entry.name]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, t(`FleetChartMaintenance.${name}`)]} />
                    </PieChart>
                    <div className={style["fleet-chart-info"]}>
                        <div className={style["fleet-chart-total"]}>{total}</div>
                        <div className={style["fleet-chart-label"]}>{t("CartVehiculeStatus.veicle")}</div>
                    </div>
                </div>
                <div className={style["fleet-chart-legend"]}>
                    {data.map((entry) => {
                        const label = t(`FleetChartMaintenance.${entry.name}`);
                        return (
                            <div key={entry.name} className={style["legend-item"]}>
                                <span className={style["legend-color"]} style={{ backgroundColor: COLORS[entry.name] }} />
                                {label}: {entry.value}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
export default FleetChartMaintenance;