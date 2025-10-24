import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Teacher from "./pages/Teacher";
import Student from "./pages/Student";
import Chart from "./pages/Chart";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassView from "./pages/ClassView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/class/:code" element={<ClassView />} />
          <Route path="/student" element={<Student />} />
          <Route path="/chart" element={<Chart />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
