import { Breadcrumb, Layout, theme } from "antd";
import React from "react";
import WorkflowBuilder from "../components/WorkflowBuilder";
const { Content } = Layout;

const ContentPage = () => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  return (
    <Content className="mx-4">
      <Breadcrumb className="my-4">
        <Breadcrumb.Item>User</Breadcrumb.Item>
        <Breadcrumb.Item>Bill</Breadcrumb.Item>
      </Breadcrumb>

      <div
        className={` bg-white rounded-lg shadow-md`}
        style={{
          borderRadius: borderRadiusLG,
        }}
      >
        <WorkflowBuilder />
      </div>
    </Content>
  );
};

export default ContentPage;
