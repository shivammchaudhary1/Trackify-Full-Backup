import * as echarts from "echarts";
import { useEffect, useRef } from "react";

const DetailedChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);

    const posList = [
      "left",
      "right",
      "top",
      "bottom",
      "inside",
      "insideTop",
      "insideLeft",
      "insideRight",
      "insideBottom",
      "insideTopLeft",
      "insideTopRight",
      "insideBottomLeft",
      "insideBottomRight",
    ];

    const labelOption = {
      show: true,
      position: "insideBottom",
      distance: 15,
      align: "left",
      verticalAlign: "middle",
      rotate: 90,
      formatter: "{c}  {name|{a}}",
      fontSize: 16,
      rich: {
        name: {},
      },
    };

    const projectNames = data?.map((project) => project.projectDetails.name);
    const developerData = data?.map((project) =>
      project.developers
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((developer) => parseInt(developer.timeSpent / 3600, 10)),
    );

    const sortedDeveloperNames = data[0]?.developers
      ?.map((developer) => developer.name)
      .sort((a, b) => a.localeCompare(b));

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {
        data: sortedDeveloperNames,
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar", "stack"] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      xAxis: [
        {
          type: "category",
          axisTick: { show: false },
          data: projectNames,
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "Total Time Spent",
        },
      ],
      series: sortedDeveloperNames?.map((developerName, index) => ({
        name: developerName,
        type: "bar",
        data: developerData?.map((group) => group[index] || 0),
      })),
    };

    myChart.setOption(option);

    return () => {
      myChart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>;
};

export default DetailedChart;
