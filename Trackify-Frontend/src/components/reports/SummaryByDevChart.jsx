import { Box } from "@mui/material";
import * as echarts from "echarts";
import { useEffect, useState } from "react";
import { formatDuration } from "##/src/utility/timer.js";

function UserPieChart({ data }) {
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const chart = echarts.init(document.getElementById("user-pie-chart"));
    const userChartData = data.map((user) => ({
      name: user.name,
      userId: user.userId,
      totalDurationByDev: user.totalTimeSpentByDeveloper,
      value: user.projects.reduce(
        (total, project) => total + project.timeSpent,
        0,
      ),
    }));
    const options = {
      title: {
        text: "Time Spent by Users",
        x: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "Click to view detailed summary of {b}",
      },
      series: [
        {
          name: "Time Spent",
          type: "pie",
          radius: "65%",
          center: ["50%", "60%"],
          data: userChartData,
          label: {
            formatter: (params) => {
              return `${params.name} | Time Spent: ${formatDuration(
                params.data.totalDurationByDev,
              )}`;
            },
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
    chart.on("click", handleChartClick);
    chart.setOption(options);
    return () => {
      if (chart) {
        chart.off("click", handleChartClick);
        chart.dispose();
      }
    };
  }, [data]);

  useEffect(() => {
    // Render a new pie chart with project details when selectedProject changes
    if (selectedProject) {
      const detailChart = echarts.init(
        document.getElementById("detail-pie-chart"),
      );
      const selectedUserData = data.find(
        (user) => user.userId === selectedProject.userId,
      );
      const projectChartData = selectedUserData?.projects?.map((project) => ({
        name: project.projectName,
        value: project.timeSpent,
        tooltip: `Contributed ${Math.floor(
          (parseInt(project.timeSpent) /
            (+project.projectEstimatedHours * 3600)) *
            100,
        )}% to the project`,
      }));
      const detailOptions = {
        title: {
          text: `Time Spent on Projects by ${selectedProject.name}`,
          x: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} seconds ({d}%)",
        },
        series: [
          {
            name: "Time Spent",
            type: "pie",
            radius: "65%",
            center: ["50%", "60%"],
            data: projectChartData,
            label: {
              formatter: (params) => {
                return `${params.name} | Time Spent: ${formatDuration(
                  params.value,
                )} `;
              },
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
      detailChart.setOption(detailOptions);
      return () => {
        if (detailChart) {
          detailChart.dispose();
        }
      };
    }
  }, [selectedProject, data]);
  const handleChartClick = (params) => {
    setSelectedProject({ userId: params.data.userId, name: params.name });
  };

  useEffect(() => {
    // Render a new pie chart with project details when selectedProject changes
    if (selectedProject) {
      const detailChart = echarts.init(
        document.getElementById("detail-pie-chart"),
      );
      const selectedUserData = data.find(
        (user) => user.userId === selectedProject.userId,
      );
      const projectChartData = selectedUserData?.projects?.map((project) => ({
        name: project.projectName,
        value: project.timeSpent,
        tooltip: `Contributed ${Math.floor(
          (parseInt(project.timeSpent) /
            (+project.projectEstimatedHours * 3600)) *
            100,
        )}% to the project`,
      }));
      const detailOptions = {
        title: {
          text: `Time Spent on Projects by ${selectedProject.name}`,
          x: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} seconds ({d}%)",
        },
        series: [
          {
            name: "Time Spent",
            type: "pie",
            radius: "65%",
            center: ["50%", "60%"],
            data: projectChartData,
            label: {
              formatter: (params) => {
                return `${params.name} | Time Spent: ${formatDuration(
                  params.value,
                )} `;
              },
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
      detailChart.setOption(detailOptions);
      return () => {
        if (detailChart) {
          detailChart.dispose();
        }
      };
    }
  }, [selectedProject, data]);

  return (
    <Box
      maxWidth="100%"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        flexDirection: {
          xs: "column",
          sm: "column",
          md: "row",
          lg: "row",
        },
      }}
    >
      <Box
        id="user-pie-chart"
        style={{
          width: "50%",
          height: "400px",
        }}
      ></Box>
      {selectedProject && (
        <Box
          id="detail-pie-chart"
          style={{
            width: "50%",
            height: "400px",
          }}
        ></Box>
      )}
    </Box>
  );
}

export default UserPieChart;
