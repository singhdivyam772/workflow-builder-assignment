import React from "react";
import { Pie } from "@ant-design/plots";

const PieChart = () => {
  // Dummy data representing the distribution of execution times by node type
  const data = [
    { type: "Node Type A", value: 30 }, // Node Type A consumes 30% of the time
    { type: "Node Type B", value: 25 }, // Node Type B consumes 25% of the time
    { type: "Node Type C", value: 20 }, // Node Type C consumes 20% of the time
    { type: "Node Type D", value: 15 }, // Node Type D consumes 15% of the time
    { type: "Node Type E", value: 10 }, // Node Type E consumes 10% of the time
  ];

  const config = {
    data, // The data to be visualized
    angleField: "value", // Defines the angle of the pie segments based on the 'value'
    colorField: "type", // Colors the segments based on the 'type' field
    label: {
      visible: true, // Display labels inside the pie segments
      type: "spider", // Label style (spider layout is common for pie charts)
      style: {
        fontWeight: "bold", // Makes the label text bold
      },
    },
    legend: {
      position: "right", // Position of the legend
      title: "Node Type", // Legend title
    },
  };

  return (
    <>
      <Pie {...config} />
    </>
  );
};

export default PieChart;
