import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  nodes: [
    {
      id: "1",
      type: "start",
      position: { x: 100, y: 100 },
      data: { label: "Start Node" },
    },
    {
      id: "2",
      type: "task",
      position: { x: 300, y: 100 },
      data: { label: "Task Node 1" },
    },
    {
      id: "3",
      type: "decision",
      position: { x: 500, y: 100 },
      data: { label: "Decision Node" },
    },
    {
      id: "4",
      type: "end",
      position: { x: 700, y: 100 },
      data: { label: "End Node" },
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
    { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
    { id: "e3-4", source: "3", target: "4", type: "smoothstep" },
  ],
  selectedNode: null,
};

const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    addNode: (state, action) => {
      state.nodes.push(action.payload);
    },
    updateNode: (state, action) => {
      const index = state.nodes.findIndex(
        (node) => node.id === action.payload.id
      );
      if (index !== -1) {
        state.nodes[index] = {
          ...state.nodes[index],
          ...action.payload.updates,
        };
      }
    },
    deleteNode: (state, action) => {
      state.nodes = state.nodes.filter((node) => node.id !== action.payload);
      state.edges = state.edges.filter(
        (edge) =>
          edge.source !== action.payload && edge.target !== action.payload
      );
    },
    addEdge: (state, action) => {
      state.edges.push(action.payload);
    },
    setSelectedNode: (state, action) => {
      state.selectedNode = action.payload;
    },
    resetWorkflow: () => initialState,
  },
});

export const {
  addNode,
  updateNode,
  deleteNode,
  addEdge,
  setSelectedNode,
  resetWorkflow,
} = workflowSlice.actions;

export default workflowSlice.reducer;
