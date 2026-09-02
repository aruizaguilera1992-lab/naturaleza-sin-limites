import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import { CookieBanner } from "./components/CookieBanner";
import { CookiePreferencesModal } from "./components/CookiePreferencesModal";
import { AnalyticsLoader } from "./components/AnalyticsLoader";
import Index from "./pages/Index";
import Actividades from "./pages/Actividades";
import Barranquismo from "./pages/Barranquismo";
import Escalada from "./pages/Escalada";
import ViasFerratas from "./pages/ViasFerratas";
import VertigoSapiensPage from "./pages/VertigoSapiensPage";
import QuienesSomos from "./pages/QuienesSomos";
import Contacto from "./pages/Contacto";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Privacidad from "./pages/Privacidad";
import Terminos from "./pages/Terminos";
import Cookies from "./pages/Cookies";
import Login from "./pages/Login";
import OAuthConsent from "./pages/OAuthConsent";
import Admin from "./pages/Admin";
import Pago from "./pages/Pago";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CookieConsentProvider>
          <Toaster />
          <Sonner />
          <AnalyticsLoader />
          <BrowserRouter>
            <CookieBanner />
            <CookiePreferencesModal />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/actividades" element={<Actividades />} />
            <Route path="/barranquismo" element={<Barranquismo />} />
            <Route path="/escalada" element={<Escalada />} />
            <Route path="/vias-ferratas" element={<ViasFerratas />} />
            <Route path="/vertigo-sapiens" element={<VertigoSapiensPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pago/:token" element={<Pago />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CookieConsentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
