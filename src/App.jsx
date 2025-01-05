import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Layout } from "antd";
import SideBar from "./layout/SideBar";

import WelcomePage from "./pages/WelcomePage";

import AnalyticsPanel from "./pages/AnalyticsPage";

import WorkflowPage from "./pages/WorkflowPage";

const App = () => {
  return (
    <Router>
      <Layout className="min-h-screen">
        {/* Sidebar */}
        <SideBar />

        <Layout>
          {/* Header */}
          {/* <Header className="bg-blue-400 flex justify-end items-center px-4">
            <p className="text-white">fousdk</p>
          </Header> */}

          {/* Content Area */}
          <Layout.Content>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/WorkflowBuilder" element={<WorkflowPage />} />
              <Route path="/AnalyticsPanel" element={<AnalyticsPanel />} />
            </Routes>
          </Layout.Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
