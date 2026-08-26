import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// index.html contains a complete semantic fallback for crawlers and visitors
// without JavaScript; the interactive walkthrough enhances/replaces it here.
createRoot(document.getElementById("root")!).render(<App />);
