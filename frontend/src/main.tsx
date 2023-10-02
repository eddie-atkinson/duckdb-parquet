import { App } from "./App.tsx";
import { createRoot } from "react-dom/client";

const appRoot = document.getElementById("app");
if (appRoot) {
  const root = createRoot(appRoot);
  root.render(<App />);
}
