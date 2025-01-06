import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, Modal, Form, Input, DatePicker, notification } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const initialTasks = JSON.parse(localStorage.getItem("tasks")) || [];

export default function WorkflowPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTaskButton, setSelectedTaskButton] = useState(null);

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [approvalForm] = Form.useForm();
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  // Save tasks to localStorage on change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Rehydrate form data when a task is selected
  useEffect(() => {
    if (selectedTaskId !== null) {
      const task = tasks.find((task) => task.id === selectedTaskId);
      if (task) {
        const taskNode = task.nodes.find(
          (node) => node.data.label === "Task Name"
        );

        if (taskNode?.data.taskDetails) {
          const { taskDetails } = taskNode.data;
          form.setFieldsValue({
            taskName: taskDetails.taskName || "Please fill the form",
            assignee: taskDetails.assignee || "Please fill the form",
            taskDuration: taskDetails.taskDuration
              ? [
                  dayjs(taskDetails.taskDuration[0]),
                  dayjs(taskDetails.taskDuration[1]),
                ]
              : [],
          });
          setSelectedTaskDetails(taskNode.data.taskDetails);
        } else {
          form.resetFields();
          setSelectedTaskDetails(null);
        }
      }
    }
  }, [selectedTaskId, tasks, form]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleCreateTask = () => {
    const taskId = tasks.length + 1;

    // Define fresh nodes and edges for the new task
    const newNodes = [
      {
        id: `task-${taskId}-1`,
        position: { x: 250, y: 150 },
        data: { label: "Task Name", taskDetails: null },
      },
      {
        id: `task-${taskId}-2`,
        position: { x: 250, y: 250 },
        data: {
          label: "Decision Process / Manager Approval",
          approvalDetails: null,
        },
      },
      {
        id: `task-${taskId}-3`,
        position: { x: 250, y: 350 },
        data: { label: "Start", timestamp: null },
      },
      {
        id: `task-${taskId}-4`,
        position: { x: 250, y: 450 },
        data: { label: "End", timestamp: null },
      },
    ];

    const newEdges = [
      {
        id: `e${taskId}-1-2`,
        source: `task-${taskId}-1`,
        target: `task-${taskId}-2`,
        animated: true,
        type: "smoothstep",
      },
      {
        id: `e${taskId}-2-3`,
        source: `task-${taskId}-2`,
        target: `task-${taskId}-3`,
        animated: true,
        type: "smoothstep",
      },
      {
        id: `e${taskId}-3-4`,
        source: `task-${taskId}-3`,
        target: `task-${taskId}-4`,
        animated: true,
      },
    ];

    setTasks((prevTasks) => [
      ...prevTasks,
      { id: taskId, nodes: newNodes, edges: newEdges },
    ]);

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskButton(taskId);
    setSelectedTaskId(taskId);

    const task = tasks.find((task) => task.id === taskId);
    if (task) {
      notification.info({
        message: `Task Selected`,
        description: `You have selected Task: ${taskId}`,
        placement: "top",
      });

      const updatedNodes = task.nodes.map((node) => {
        if (node.data.label === "Task Name" && !node.data.taskDetails) {
          return {
            ...node,
            data: {
              ...node.data,
              taskDetails: { taskName: "", assignee: "", taskDuration: [] },
            },
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      setEdges(task.edges);
    }
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);

    if (node.data.label === "Task Name") {
      setIsTaskModalVisible(true);
    }

    if (node.data.label === "Decision Process / Manager Approval") {
      const taskNode = nodes.find((n) => n.data.label === "Task Name");

      if (!taskNode?.data.taskDetails) {
        notification.error({
          message: "Please complete Task Name details first!",
          description:
            "You need to fill out the Task Name details before proceeding.",
          placement: "top",
        });
        return;
      }

      const approvalDetails = node.data.approvalDetails || {
        decision: "Please fill the form",
        comment: "Please fill the form",
      };
      approvalForm.setFieldsValue(approvalDetails);

      setIsApprovalModalVisible(true);
    }

    if (node.data.label === "Start") {
      const timestamp = dayjs().format();
      const updatedNodes = nodes.map((n) => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, timestamp } };
        }
        return n;
      });
      setNodes(updatedNodes);

      // Update tasks in localStorage after setting the nodes
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, nodes: updatedNodes }; // Update task with new nodes
        }
        return task;
      });
      setTasks(updatedTasks);

      // Save to localStorage after updating the task
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));

      notification.success({
        message: "Project Started",
        description: `Project started at ${timestamp}`,
        placement: "top",
      });
    }

    if (node.data.label === "End") {
      const updatedNodes = nodes.map((n) => {
        if (n.id === node.id) {
          return { ...n, data: { ...n.data, timestamp: dayjs().format() } };
        }
        return n;
      });
      setNodes(updatedNodes);

      // Update tasks in localStorage after setting the nodes
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, nodes: updatedNodes };
        }
        return task;
      });
      setTasks(updatedTasks);

      // Save to localStorage after updating the task
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));

      notification.success({
        message: "Project Ended",
        description: `Project ended at ${dayjs().format()}`,
        placement: "top",
      });
    }

    const updatedNodes = nodes.map((n) => {
      let newStyle = { ...n.style };
      if (n.id === node.id) {
        if (n.data.label === "Task Name") {
          newStyle = {
            ...newStyle,
            backgroundColor: n.data.taskDetails ? "green" : "red",
          };
        }
        if (n.data.label === "Decision Process / Manager Approval") {
          newStyle = {
            ...newStyle,
            backgroundColor: n.data.approvalDetails ? "green" : "red",
          };
        }
      }
      return { ...n, style: newStyle };
    });

    setNodes(updatedNodes);
  };

  const handleTaskSave = async () => {
    try {
      const values = await form.validateFields();
      const { taskDuration } = values;
      const totalTime = taskDuration
        ? dayjs(taskDuration[0]).format("YYYY-MM-DD") +
          " to " +
          dayjs(taskDuration[1]).format("YYYY-MM-DD")
        : "";

      notification.success({
        message: "Task Saved",
        description: `Task "${values.taskName}" created successfully!`,
        placement: "top",
      });

      const updatedNodes = nodes.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              taskDetails: { ...values, taskDuration: totalTime },
            },
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      setIsTaskModalVisible(false);

      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, nodes: updatedNodes };
        }
        return task;
      });

      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (err) {
      console.log("Error saving task", err);
    }
  };

  const handleApprovalSave = async () => {
    try {
      const values = await approvalForm.validateFields();

      notification.success({
        message: "Approval Saved",
        description: `Approval decision: "${values.decision}"`,
        placement: "top",
      });

      const updatedNodes = nodes.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              approvalDetails: { ...values },
            },
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      setIsApprovalModalVisible(false);

      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, nodes: updatedNodes };
        }
        return task;
      });

      setTasks(updatedTasks);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    } catch (err) {
      console.log("Error saving approval", err);
    }
  };

  const handleModalCancel = () => {
    setIsTaskModalVisible(false);
    setIsApprovalModalVisible(false);
  };

  const handleDeleteTask = (taskId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this task?",
      content: "This action cannot be undone.",
      onOk: () => {
        const newTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(newTasks);
        localStorage.setItem("tasks", JSON.stringify(newTasks));
        notification.success({
          message: "Task Deleted",
          description: `Task ${taskId} has been deleted successfully.`,
          placement: "top",
        });
      },
      onCancel: () => {
        notification.info({
          message: "Task Deletion Canceled",
          description: `Task ${taskId} was not deleted.`,
          placement: "top",
        });
      },
      okText: "Yes, Delete",
      cancelText: "No, Keep",
    });
  };

  return (
    <div className="w-full min-h-[100vh] flex flex-col justify-center p-4 items-center">
      <h1 className="flex justify-center items-center mb-4 rounded-lg py-3 font-semibold border-blue-500 text-blue-500 text-2xl border-2 w-full">
        Workflow Builder
      </h1>
      <div className="lg:grid flex flex-col lg:grid-cols-[1fr_3fr_1fr] w-full min-h-[80vh] gap-2">
        {/* Task List */}
        <div className="h-full border border-blue-500 rounded-lg">
          <div className="flex flex-col justify-center items-center p-2 w-full">
            <h2 className="w-full lg:font-bold font-semibold lg:text-xl text-lg text-center shadow-lg shadow-blue-100 rounded-lg py-2">
              Total Task
            </h2>
            <Button
              onClick={handleCreateTask}
              variant="contained"
              className="my-2 w-full py-2"
            >
              Create Task
            </Button>
            <div className="mt-4 w-full">
              <ul className="w-full text-lg">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex justify-around shadow-xl rounded-lg my-2 border-2 w-full items-center"
                  >
                    <Button
                      key={task.id}
                      onClick={() => handleTaskClick(task.id)}
                      className="my-2"
                      style={{
                        backgroundColor:
                          selectedTaskButton === task.id ? "green" : "",
                        color: selectedTaskButton === task.id ? "white" : "",
                      }}
                    >
                      Task {task.id}
                    </Button>

                    <DeleteOutlined
                      className="text-red-500"
                      onClick={() => handleDeleteTask(task.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* React Flow */}
        <div className="w-full lg:h-full h-[60vh] border border-blue-500 rounded-lg">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            className="bg-dark"
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={18} size={1} />
          </ReactFlow>
        </div>

        {/* Task Details */}
        <div className="h-full border border-blue-500 rounded-lg">
          <div className="flex flex-col justify-center items-center p-2 w-full">
            <h2 className="w-full lg:font-bold font-semibold lg:text-xl text-lg text-center shadow-lg shadow-blue-100 rounded-lg py-2">
              Task Details
            </h2>

            {/* Render Task Details or message if no task is selected */}
            <div className="mt-4 w-full">
              {selectedTaskId ? (
                <div>
                  <h3 className="font-semibold">
                    Task Name:{" "}
                    {selectedTaskDetails?.taskName || "Please fill the form"}
                  </h3>
                  <p>
                    <strong>Assignee:</strong>{" "}
                    {selectedTaskDetails?.assignee || "Please fill the form"}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {selectedTaskDetails?.taskDuration
                      ? `${selectedTaskDetails.taskDuration[0]} to ${selectedTaskDetails.taskDuration[1]}`
                      : "Please fill the form"}
                  </p>
                  <hr />
                  <h3 className="font-semibold">
                    Decision Process:{" "}
                    {selectedNode?.data?.approvalDetails?.decision ||
                      "Please fill the form"}
                  </h3>
                  <p>
                    <strong>Comment:</strong>{" "}
                    {selectedNode?.data?.approvalDetails?.comment ||
                      "Please fill the form"}
                  </p>
                </div>
              ) : (
                <p>Please select a task to see the details.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <Modal
        title="Create Task"
        visible={isTaskModalVisible}
        onCancel={handleModalCancel}
        onOk={handleTaskSave}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="taskName"
            label="Task Name"
            rules={[{ required: true, message: "Please input the task name!" }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>

          <Form.Item
            name="assignee"
            label="Assignee"
            rules={[{ required: true, message: "Please input the assignee!" }]}
          >
            <Input placeholder="Enter assignee name" />
          </Form.Item>

          <Form.Item
            name="taskDuration"
            label="Task Duration"
            rules={[
              { required: true, message: "Please select task duration!" },
            ]}
          >
            <DatePicker.RangePicker />
          </Form.Item>
        </Form>
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Approval Process"
        visible={isApprovalModalVisible}
        onCancel={handleModalCancel}
        onOk={handleApprovalSave}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={approvalForm} layout="vertical">
          <Form.Item
            name="decision"
            label="Decision"
            rules={[{ required: true, message: "Please input the decision!" }]}
          >
            <Input placeholder="Enter decision" />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Comment"
            rules={[{ required: true, message: "Please add a comment!" }]}
          >
            <Input.TextArea placeholder="Enter your comment" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
