import React, { useEffect } from "react";
import LineChart from "../components/AnalyticsPanelComponents/LineChart";
import BarChart from "../components/AnalyticsPanelComponents/BarChart";
import PieChart from "../components/AnalyticsPanelComponents/PieChart";

const AnalyticsPanel = () => {
  useEffect(() => {
    // Retrieve data from localStorage
    const data = localStorage.getItem("yourDataKey"); // Replace "yourDataKey" with the actual key name used in localStorage
    console.log(data); // Log the data to the console

    // Optionally, parse the data if it's in JSON format
    if (data) {
      const parsedData = JSON.parse(data);
      console.log(parsedData); // Log the parsed data to the console
    }
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <div className=" w-full min-h-[100vh] flex flex-col justify-center p-4 items-center">
      <h1 className=" flex justify-center items-center mb-4 rounded-lg py-3 font-semibold border-blue-500 text-blue-500 text-2xl border-2 w-full">
        Analytics Panel Charts
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 w-full min-h-[80vh] gap-2 ">
        <LineChart />
        <BarChart />
        <PieChart />
      </div>
    </div>
  );
};

export default AnalyticsPanel;
