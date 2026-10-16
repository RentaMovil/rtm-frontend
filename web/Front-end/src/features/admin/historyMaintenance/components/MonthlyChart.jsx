import style from './MonthlyChart.module.css';
import { useTranslation } from "react-i18next";

import {ResponsiveContainer, BarChart,Bar,XAxis,YAxis, CartesianGrid,Tooltip} from "recharts";
function MonthlyChart({ records }) {
    const { t } = useTranslation();
    const months = t("History.months", { returnObjects: true });

    const monthlyData = months.map((month, index) => ({
        month,
        total: records.filter((record) => {
            // startDate llega como yyyy-mm-dd: el mes se lee del texto para no depender de la zona horaria
            const month = record.date ? Number(String(record.date).slice(5, 7)) : NaN;
            return month - 1 === index;
        }).length,
    }));
    return (
        
<div className={style["chart-container"]}>
    <h3>{t("History.title3")}:</h3>

    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar
                dataKey="total"
                radius={[8,8,0,0]}
                fill="#F2C063"
            />
        </BarChart>
    </ResponsiveContainer>
</div>
        
    )
}
export default MonthlyChart;