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
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Radio,
  notification,
} from "antd";
import {
  EditOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
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
            taskName: taskDetails.taskName || "",
            assignee: taskDetails.assignee || "",
            taskDuration: taskDetails.taskDuration
              ? [
                  dayjs(taskDetails.taskDuration[0]),
                  dayjs(taskDetails.taskDuration[1]),
                ]
              : [],
          });
        } else {
          form.resetFields();
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
        decision: "",
        comment: "",
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
          return { ...task, nodes: updatedNodes }; // Update task with new nodes
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
        ? dayjs(taskDuration[1]).diff(dayjs(taskDuration[0]), "days")
        : 0;

      values.totalTime = totalTime;

      notification.success({
        message: "Task Created",
        description: `Task Name: ${values.taskName}, Assignee: ${values.assignee}, Duration: ${totalTime} days`,
        placement: "top",
      });

      setIsTaskModalVisible(false);
      form.resetFields();

      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          const updatedNodes = task.nodes.map((node) => {
            if (node.data.label === "Task Name") {
              return {
                ...node,
                data: { ...node.data, taskDetails: values },
              };
            }
            return node;
          });
          return { ...task, nodes: updatedNodes };
        }
        return task;
      });

      setTasks(updatedTasks);
    } catch (error) {
      console.log("Error saving task:", error);
    }
  };

  const handleApprovalSave = async () => {
    try {
      const values = await approvalForm.validateFields();
      notification.success({
        message: "Decision Saved",
        description: `Action: ${values.decision}, Comment: ${values.comment}`,
        placement: "topRight",
      });

      setIsApprovalModalVisible(false);
      approvalForm.resetFields();

      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          const updatedNodes = task.nodes.map((node) => {
            if (node.data.label === "Decision Process / Manager Approval") {
              return {
                ...node,
                data: { ...node.data, approvalDetails: values },
              };
            }
            return node;
          });
          return { ...task, nodes: updatedNodes };
        }
        return task;
      });
      setTasks(updatedTasks);
    } catch (error) {
      console.log("Error saving decision:", error);
    }
  };

  const handleModalCancel = () => {
    setIsTaskModalVisible(false);
    setIsApprovalModalVisible(false);
    form.resetFields();
    approvalForm.resetFields();
  };

  const handleDeleteTask = (taskId) => {
    console.log(`id:${taskId}`);
    Modal.confirm({
      title: "Are you sure you want to delete this task?",
      onOk: () => {
        // Remove the task from the tasks list
        const updatedTasks = tasks.filter((task) => task.id !== taskId);

        // Update the tasks state
        setTasks(updatedTasks);

        console.log("updated task, ", updatedTasks);

        if (!updatedTasks.length > 0) {
          setEdges([]);
          setNodes([]);
        }

        // Notify the user about the deletion
        notification.success({
          message: "Task Deleted",
          description: `Task ${taskId} and its associated nodes have been deleted.`,
          placement: "top",
        });
      },
    });
  };

  const CustomNode = ({ data }) => {
    const fillColor =
      data.taskDetails || data.approvalDetails ? "green" : "red";

    return (
      <div
        style={{
          position: "relative",
          padding: "10px",
          border: "1px solid black",
        }}
      >
        <div>{data.label}</div>
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: fillColor,
          }}
        ></div>
      </div>
    );
  };

  return (
    <div className=" w-full min-h-[100vh] flex flex-col justify-center p-4 items-center">
      <h1 className=" flex justify-center items-center mb-4 rounded-lg py-3 font-semibold border-blue-500 text-blue-500 text-2xl border-2 w-full">
        Workflow Bulder
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr_1fr] w-full min-h-[80vh] gap-2 ">
        <div className="h-full border border-blue-500 order-1 lg:order-none rounded-lg">
          <div className="flex flex-col justify-center items-center p-2 w-full">
            <h2 className="w-full font-bold text-xl text-center shadow-lg shadow-blue-100 rounded-lg py-2">
              Total Task
            </h2>
            <Button
              onClick={handleCreateTask}
              variant="contained"
              className="my-2 w-full py-2"
            >
              Create Task
            </Button>
            <div className="mt-4  w-full">
              <ul className=" w-full text-lg ">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className=" flex justify-around shadow-xl rounded-lg my-2 border-2 w-full items-center"
                  >
                    <Button
                      type="link"
                      className={`border-2 gap-4 my-2 shadow-lg ${
                        selectedTaskId === task.id
                          ? "border-red-500 text-red-500"
                          : "border-blue-500 text-blue-500"
                      }`}
                      onClick={() => handleTaskClick(task.id)}
                    >
                      Task {task.id}
                    </Button>
                    <DeleteOutlined
                      className=" text-red-500 "
                      onClick={() => handleDeleteTask(task.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          className="order-2 lg:order-none bg-dark"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={18} size={1} />
        </ReactFlow>

        <div className="h-full border order-3 lg:order-none rounded-lg">
          <div className="flex flex-col justify-center items-center p-2 w-full">
            <h2 className="w-full font-bold text-xl text-center shadow-lg shadow-blue-100 rounded-lg py-2">
              Task details
            </h2>
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
              rules={[
                { required: true, message: "Please input the task name!" },
              ]}
            >
              <Input placeholder="Enter task name" />
            </Form.Item>

            <Form.Item
              name="assignee"
              label="Assignee"
              rules={[
                { required: true, message: "Please input the assignee name!" },
              ]}
            >
              <Input placeholder="Enter assignee name" />
            </Form.Item>

            <Form.Item
              name="taskDuration"
              label="Task Duration"
              rules={[
                { required: true, message: "Please select the task duration!" },
              ]}
            >
              <DatePicker.RangePicker />
            </Form.Item>
          </Form>
        </Modal>

        {/* Approval Modal */}
        <Modal
          title="Manager Approval"
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
              rules={[
                { required: true, message: "Please select the decision!" },
              ]}
            >
              <Radio.Group>
                <Radio value="approved">Approve</Radio>
                <Radio value="rejected">Reject</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="comment" label="Comment">
              <Input.TextArea placeholder="Enter comments" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
