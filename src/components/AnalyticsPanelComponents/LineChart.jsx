import React from "react";
import { Line } from "@ant-design/plots";

const LineChart = () => {
  // Dummy data representing cumulative execution time across workflow nodes
  const data = [
    { node: "Node 1", time: 2 },
    { node: "Node 2", time: 5 }, // 5 is the cumulative time at this point
    { node: "Node 3", time: 9 }, // 9 is cumulative time from Node 1 to Node 3
    { node: "Node 4", time: 14 },
    { node: "Node 5", time: 18 },
    { node: "Node 6", time: 22 },
    { node: "Node 7", time: 28 },
    { node: "Node 8", time: 35 },
    { node: "Node 9", time: 45 },
  ];

  const config = {
    data,
    xField: "node", // X-axis represents the nodes
    yField: "time", // Y-axis represents cumulative time
    point: {
      shapeField: "square",
      sizeField: 4,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
  };

  return (
    <>
      <Line {...config} />
    </>
  );
};

export default LineChart;
