import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Seo
        title="Página no encontrada | Naturaleza Sin Límites"
        description="La página que buscas no existe o ha cambiado de dirección."
        path={location.pathname}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 font-heading text-5xl font-bold">404</h1>
        <p className="mb-2 text-xl text-foreground">Esta página no existe</p>
        <p className="mb-8 text-muted-foreground">
          Puede que el enlace haya cambiado. Prueba con nuestras actividades o escríbenos.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="transition-all duration-300 active:scale-95">
            <Link to="/actividades">Ver actividades</Link>
          </Button>
          <Button asChild variant="outline" className="transition-all duration-300 active:scale-95">
            <Link to="/">Volver al inicio</Link>
          </Button>
          <Button asChild variant="ghost" className="transition-all duration-300 active:scale-95">
            <Link to="/contacto">Contactar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
