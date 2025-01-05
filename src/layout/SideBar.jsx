import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for routing
import Sider from "antd/es/layout/Sider";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";

// Function to create menu items
function getItem(label, key, icon, children, path) {
  return {
    key,
    icon,
    children,
    label,
    path,
  };
}

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <div className="demo-logo-vertical" />
      <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
        {items.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.path || "#"}>{item.label}</Link>{" "}
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default SideBar;

// Define the menu items, with paths for routing
const items = [
  getItem("Welcome Page", "1", <DesktopOutlined />, null, "/"), // Home page
  getItem("WorkflowBuilder", "2", <UserOutlined />, null, "/WorkflowBuilder"), // User page
  getItem("AnalyticsPanel", "3", <TeamOutlined />, null, "/AnalyticsPanel"), // Team page
];
