import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage";
import KanbanPage from "@/pages/KanbanPage";
import GembaWalkPage from "@/pages/GembaWalkPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import VSMPage from "@/pages/VSMPage";
import FishbonePage from "@/pages/FishbonePage";
import RootCausePage from "@/pages/RootCausePage";
import PDCAPage from "@/pages/PDCAPage";
import ImprovementPlanPage from "@/pages/ImprovementPlanPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/gemba-walk" element={<GembaWalkPage />} />
            <Route path="/vsm" element={<VSMPage />} />
            <Route path="/root-cause" element={<RootCausePage />} />
            <Route path="/fishbone" element={<FishbonePage />} />
            <Route path="/improvement" element={<PlaceholderPage title="Improvement Plan" description="Task management with PIC assignment, deadlines, and status tracking. Coming soon." />} />
            <Route path="/pdca" element={<PDCAPage />} />
            <Route path="/analytics" element={<PlaceholderPage title="Analytics" description="KPI dashboards, OEE monitoring, trend analytics, and waste analysis. Coming soon." />} />
            <Route path="/reports" element={<PlaceholderPage title="Report Builder" description="5-step wizard to generate PPT reports from project data. Coming soon." />} />
            <Route path="/chat" element={<PlaceholderPage title="Team Chat" description="Real-time channel-based messaging with file attachments and @mentions. Coming soon." />} />
            <Route path="/documents" element={<PlaceholderPage title="Document Center" description="File management with folder structure, version history, and preview. Coming soon." />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" description="User management, RBAC, notifications, and system configuration. Coming soon." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
