import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from '@/context/CookieConsentContext';

const sections = [
  {
    id: 'que-son',
    title: '1. ¿Qué son las cookies?',
    content: (
      <p>
        Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
        cuando los visitas. Permiten recordar información sobre tu navegación (idioma, preferencias,
        sesión) y obtener datos estadísticos sobre el uso del sitio. En este sitio también
        utilizamos tecnologías equivalentes como el almacenamiento local del navegador.
      </p>
    ),
  },
  {
    id: 'responsable',
    title: '2. Responsable',
    content: (
      <ul className="space-y-2 list-disc pl-5">
        <li><strong className="text-foreground">Titular:</strong> Naturaleza Sin Límites (proyecto personal)</li>
        <li>
          <strong className="text-foreground">Email:</strong>{' '}
          <a href="mailto:naturaleza.s.limites@gmail.com" className="text-primary hover:underline">
            naturaleza.s.limites@gmail.com
          </a>
        </li>
        <li><strong className="text-foreground">Ubicación:</strong> Málaga, Andalucía, España</li>
      </ul>
    ),
  },
  {
    id: 'tipos',
    title: '3. Tipos de cookies que utilizamos',
    content: (
      <ul className="space-y-3 list-disc pl-5">
        <li>
          <strong className="text-foreground">Técnicas o necesarias:</strong> imprescindibles para el
          funcionamiento del sitio y para recordar tu elección sobre cookies. No requieren
          consentimiento. Incluyen la cookie <code className="text-primary">nsl_cookie_consent</code>,
          que guarda tus preferencias durante 180 días.
        </li>
        <li>
          <strong className="text-foreground">Analíticas:</strong> nos permiten medir el tráfico y
          entender cómo se usa la web para mejorarla. Solo se cargan si las aceptas.
        </li>
        <li>
          <strong className="text-foreground">De preferencias:</strong> recuerdan ajustes como idioma
          o región. Solo se cargan si las aceptas.
        </li>
        <li>
          <strong className="text-foreground">De marketing:</strong> utilizadas para mostrar
          publicidad relevante en función de tus intereses. Solo se cargan si las aceptas.
        </li>
      </ul>
    ),
  },
  {
    id: 'terceros',
    title: '4. Cookies de terceros',
    content: (
      <p>
        Si aceptas las cookies analíticas o de marketing, pueden instalarse cookies gestionadas por
        terceros (por ejemplo, proveedores de analítica web). Estos proveedores tratan los datos
        conforme a sus propias políticas de privacidad. Ningún script no esencial se carga antes de
        obtener tu consentimiento.
      </p>
    ),
  },
  {
    id: 'duracion',
    title: '5. Duración',
    content: (
      <p>
        Las cookies que utilizamos tienen una duración máxima de <strong className="text-foreground">13 meses</strong>.
        Transcurrido ese plazo se te volverá a solicitar el consentimiento.
      </p>
    ),
  },
  {
    id: 'gestion',
    title: '6. Cómo gestionar o retirar tu consentimiento',
    content: (
      <>
        <p className="mb-4">
          Puedes aceptar, rechazar o personalizar las cookies en cualquier momento desde el botón
          «Configurar cookies» del pie de página o desde el botón que encontrarás al final de esta
          página. Retirar el consentimiento es tan sencillo como otorgarlo.
        </p>
        <p>
          También puedes bloquear o eliminar las cookies desde la configuración de tu navegador
          (Chrome, Firefox, Safari, Edge). Ten en cuenta que desactivar las cookies técnicas puede
          afectar al funcionamiento del sitio.
        </p>
      </>
    ),
  },
  {
    id: 'mas-info',
    title: '7. Más información',
    content: (
      <p>
        Para conocer cómo tratamos tus datos personales, consulta nuestra{' '}
        <Link to="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>{' '}
        y los{' '}
        <Link to="/terminos" className="text-primary hover:underline">Términos y Condiciones</Link>.
      </p>
    ),
  },
];

export default function Cookies() {
  const { openPreferences } = useCookieConsent();

  return (
    <>
      <Helmet>
        <title>Política de Cookies | Naturaleza Sin Límites</title>
        <meta
          name="description"
          content="Política de Cookies de Naturaleza Sin Límites: qué cookies usamos, para qué sirven y cómo gestionar o retirar tu consentimiento."
        />
        <meta property="og:title" content="Política de Cookies | Naturaleza Sin Límites" />
        <meta
          property="og:description"
          content="Qué cookies usamos, para qué sirven y cómo gestionar tu consentimiento."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <ScrollToTop />
        <Navbar />

        <main className="pt-44 md:pt-40 pb-20">
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background pointer-events-none" />
            <div className="container mx-auto px-4 relative">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                  <Cookie className="h-4 w-4" />
                  Transparencia
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Política de <span className="text-primary">Cookies</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Te explicamos qué cookies utilizamos en este sitio, con qué finalidad y cómo puedes
                  controlarlas en todo momento.
                </p>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              {sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8"
                >
                  <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-4">
                    {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed">{section.content}</div>
                </article>
              ))}

              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  ¿Quieres cambiar tus preferencias de cookies?
                </p>
                <Button onClick={openPreferences}>Configurar cookies</Button>
                <p className="text-sm text-muted-foreground mt-6">
                  Última actualización: 1 de septiembre de 2026
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}
