import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Actividades from "./pages/Actividades";
import Barranquismo from "./pages/Barranquismo";
import Escalada from "./pages/Escalada";
import Espeleologia from "./pages/Espeleologia";
import ViasFerratas from "./pages/ViasFerratas";
import VertigoSapiensPage from "./pages/VertigoSapiensPage";
import QuienesSomos from "./pages/QuienesSomos";
import Contacto from "./pages/Contacto";
import Admin from "./pages/Admin";
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
          <Route path="/actividades" element={<Actividades />} />
          <Route path="/barranquismo" element={<Barranquismo />} />
          <Route path="/escalada" element={<Escalada />} />
          <Route path="/espeleologia" element={<Espeleologia />} />
          <Route path="/vias-ferratas" element={<ViasFerratas />} />
          <Route path="/vertigo-sapiens" element={<VertigoSapiensPage />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
