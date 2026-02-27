// src/app/App.jsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router.js";
import ErrorBoundary from "@/shared/components/ErrorBoundary.js";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default App;
