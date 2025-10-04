import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import App from '@/App';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserManagementPage } from "@/pages/UserManagementPage";
import { DefinitionsPage } from "@/pages/DefinitionsPage";
import { SdcTrackingPage } from "@/pages/SdcTrackingPage";
import { UserProfilePage } from "@/pages/UserProfilePage";
import { DocumentsPage } from "@/pages/DocumentsPage";
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <App />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "users",
            element: <UserManagementPage />,
          },
          {
            path: "definitions/:definitionType",
            element: <DefinitionsPage />,
          },
          {
            path: "sdc-tracking",
            element: <SdcTrackingPage />,
          },
          {
            path: "documents",
            element: <DocumentsPage />,
          },
          {
            path: "profile",
            element: <UserProfilePage />,
          },
        ],
      },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);