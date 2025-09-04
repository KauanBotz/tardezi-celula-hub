import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import PrayerRequests from "./pages/PrayerRequests.tsx";
import Testimonies from "./pages/Testimonies.tsx";
import DailyWord from "./pages/DailyWord.tsx";
import AdminDashboard from './pages/AdminDashboard.tsx'; // Adicione esta linha
import Settings from './pages/Settings.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/pedidos-de-oracao",
    element: <PrayerRequests />,
  },
  {
    path: "/testemunhos",
    element: <Testimonies />,
  },
  {
    path: "/palavra-do-dia",
    element: <DailyWord />,
  },
  {
    path: "/admin", // Adicione esta rota
    element: <AdminDashboard />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  </StrictMode>,
)