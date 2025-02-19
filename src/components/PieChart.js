import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ expenses }) => {

    const [chartData, setChartData] = useState(null);

    useEffect(() => {
      if (expenses && expenses.length > 0) {
          const categoryTotals = expenses.reduce((acc, entry) => {
              const category = entry.category || "Other";
              acc[category] = (acc[category] || 0) + Number(entry.amount || 0);
              return acc;
          }, {});
  
          setChartData({
              labels: Object.keys(categoryTotals),
              datasets: [
                  {
                      data: Object.values(categoryTotals),
                      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF", "#FF9F40"],
                      hoverBackgroundColor: ["#FF4B61", "#2A85D9", "#FFB833", "#388E3C", "#7C4DFF", "#FF6D40"],
                  },
              ],
          });
      } else {
          setChartData(null); 
      }
  }, [expenses]); 
  
    if (!chartData) return <p>Loading chart...</p>;

    return (
        <div className="pie-chart">
            <h2>📊 Expense Breakdown</h2>
            <Pie data={chartData} />
        </div>
    );
};

export default PieChart;

