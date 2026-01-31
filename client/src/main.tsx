import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactQueryProvider } from "./provider/react-query.provider.tsx";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 Starting application...");

try {
  const rootElement = document.getElementById("root");
  console.log("📍 Root element:", rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found!");
  }
  
  console.log("🔧 Creating React root...");
  const root = createRoot(rootElement);
  
  console.log("🎨 Rendering app...");
  root.render(
    <StrictMode>
      <ReactQueryProvider>
        <App />
      </ReactQueryProvider>
    </StrictMode>
  );
  
  console.log("✅ App rendered successfully!");
} catch (error) {
  console.error("❌ Failed to initialize app:", error);
  // Show error in DOM so it's visible
  document.body.innerHTML = `<div style="color: white; padding: 20px; font-family: monospace;">
    <h1>Application Error</h1>
    <pre>${error instanceof Error ? error.message : String(error)}</pre>
    <pre>${error instanceof Error ? error.stack : ''}</pre>
  </div>`;
}
