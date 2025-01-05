import React from "react";
import { Column } from "@ant-design/plots";

const BarChart = () => {
  // Dummy data representing execution time for different nodes
  const data = [
    { node: "Task Start", executionTime: 2 }, // Task Start takes 2 seconds
    { node: "Task Processing", executionTime: 10 }, // Task Processing takes 10 seconds
    { node: "Approval", executionTime: 5 }, // Approval takes 5 seconds
    { node: "Task End", executionTime: 3 }, // Task End takes 3 seconds
    { node: "Notification", executionTime: 1 }, // Notification takes 1 second
  ];

  const config = {
    data,
    xField: "node", // The node names (Task Start, Task Processing, etc.)
    yField: "executionTime", // Execution times for each node
    label: {
      // Label for each bar (show the execution time on top of the bars)
      text: (originData) => `${originData.executionTime} sec`,
      offset: 10,
    },
    style: {
      fill: "#2989FF", // Set a consistent fill color for all bars
    },
    legend: false,
  };

  return (
    <>
      {" "}
      <Column {...config} />
    </>
  );
};

export default BarChart;
