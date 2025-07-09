import { Box } from "@mui/material";
import * as echarts from "echarts";
import { useEffect } from "react";
import { formatDuration } from "##/src/utility/timer.js";

function PieChart({ reportData }) {
  useEffect(() => {
    const chart = echarts.init(document.getElementById("summary"));

    const totalTimeSpentInAllProject = reportData.reduce(
      (total, project) => total + parseInt(project.timeSpent),
      0
    );

    const pieChartData = reportData.map((project) => ({
      name: project.name,
      value: (parseInt(project.timeSpent) / totalTimeSpentInAllProject) * 100,
      completed: Math.floor(
        (parseInt(project.timeSpent) / (+project.estimatedHours * 3600)) * 100
      ),
      tooltip: `${project.name}: ${Math.floor((parseInt(project.timeSpent) / (+project.estimatedHours * 3600)) * 100)}% Completed | Spent: ${formatDuration(project.timeSpent)}`,
    }));

    const options = {
      title: {
        text: "Time Spent on Projects",
        x: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}% ({d} seconds)",
      },
      series: [
        {
          name: "Time Spent",
          type: "pie",
          radius: "65%",
          center: ["50%", "60%"],
          data: pieChartData,
          label: {
            formatter: (params) => {
              return `${params.name} | Completed: ${params.data.completed}%`;
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
    chart.setOption(options);
    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, []);

  return (
    <Box>
      <Box id="summary" style={{ width: "100%", height: "400px" }}></Box>
    </Box>
  );
}

export default PieChart;
