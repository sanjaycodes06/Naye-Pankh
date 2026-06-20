import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#1f2d3d",
            boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.12)",
          },
          success: {
            iconTheme: { primary: "#2d8a4e", secondary: "#fff" },
            style: { border: "1px solid #aedbb8" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            style: { border: "1px solid #fca5a5" },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
