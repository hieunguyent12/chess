import React from "react";
import ReactDOM from "react-dom/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import App from "./App.tsx";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <DndProvider backend={HTML5Backend}>
    {/* React Strictmode causes react-dnd to not work properly */}
    {/* <React.StrictMode> */}
    <App />
    {/* </React.StrictMode> */}
  </DndProvider>
);
