import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';

const sections = [
  {
    id: 'responsable',
    title: '1. Responsable del Tratamiento',
    content: (
      <>
        <p className="mb-4">
          El responsable del tratamiento de los datos personales recogidos a través de este sitio web es:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong className="text-foreground">Identidad:</strong> Naturaleza Sin Límites (proyecto personal)</li>
          <li>
            <strong className="text-foreground">Email:</strong>{' '}
            <a href="mailto:naturaleza.s.limites@gmail.com" className="text-primary hover:underline">
              naturaleza.s.limites@gmail.com
            </a>
          </li>
          <li>
            <strong className="text-foreground">Teléfono:</strong>{' '}
            <a href="tel:+34685609542" className="text-primary hover:underline">
              +34 685 60 95 42
            </a>
          </li>
          <li><strong className="text-foreground">Dirección:</strong> Málaga, Andalucía, España</li>
        </ul>
      </>
    ),
  },
  {
    id: 'datos',
    title: '2. Datos que recogemos y finalidades',
    content: (
      <>
        <p className="mb-4">
          En Naturaleza Sin Límites tratamos únicamente los datos personales necesarios para gestionar tus consultas, reservas y entrenamientos. Los datos que podemos recoger y sus finalidades son:
        </p>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            <strong className="text-foreground">Datos de contacto</strong> (nombre, email, teléfono): gestionar consultas y reservas de actividades de aventura y entrenamiento.
          </li>
          <li>
            <strong className="text-foreground">Datos de reserva</strong> (actividad, fecha, número de personas, nivel): organizar, planificar y ejecutar la actividad contratada con seguridad.
          </li>
          <li>
            <strong className="text-foreground">Email para newsletter</strong>: envío de comunicaciones comerciales, novedades y ofertas, siempre con tu consentimiento expreso previo.
          </li>
          <li>
            <strong className="text-foreground">Datos de navegación y cookies</strong>: análisis del uso del sitio web y mejora de la experiencia, únicamente con tu consentimiento previo.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'base-juridica',
    title: '3. Base jurídica del tratamiento',
    content: (
      <>
        <p className="mb-4">
          La legitimidad para el tratamiento de tus datos se basa en las siguientes bases jurídicas conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD):
        </p>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            <strong className="text-foreground">Ejecución de contrato:</strong> para gestionar reservas y prestar los servicios contratados.
          </li>
          <li>
            <strong className="text-foreground">Consentimiento del interesado:</strong> para el envío de newsletter y para el uso de cookies analíticas o de marketing.
          </li>
          <li>
            <strong className="text-foreground">Interés legítimo:</strong> para responder a consultas y comunicaciones iniciadas por el usuario.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'conservacion',
    title: '4. Conservación de los datos',
    content: (
      <>
        <p className="mb-4">
          Tus datos personales se conservarán durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables:
        </p>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            <strong className="text-foreground">Datos de contacto y reservas:</strong> mientras dure la relación comercial y, posteriormente, durante <strong>5 años</strong> para cumplir con obligaciones fiscales, contables y legales.
          </li>
          <li>
            <strong className="text-foreground">Newsletter:</strong> hasta que retires tu consentimiento o nos solicites la baja.
          </li>
          <li>
            <strong className="text-foreground">Cookies:</strong> según se detalla en la política de cookies, con una duración máxima de <strong>13 meses</strong>.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'destinatarios',
    title: '5. Destinatarios y encargados del tratamiento',
    content: (
      <>
        <p className="mb-4">
          Naturaleza Sin Límites no cede tus datos personales a terceros, salvo cuando sea necesario para cumplir una obligación legal o para la prestación de servicios.
        </p>
        <p className="mb-4">
          Utilizamos los siguientes proveedores de servicios que actúan como encargados del tratamiento:
        </p>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            <strong className="text-foreground">Google LLC</strong> (Google Analytics, Google Maps): ubicado en Estados Unidos, con salvaguardas basadas en Cláusulas Contractuales Tipo (SCC) y el Data Privacy Framework de la UE-EE.UU.
          </li>
          <li>
            <strong className="text-foreground">Lovable</strong>: plataforma de alojamiento y despliegue del sitio web.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'derechos',
    title: '6. Derechos del usuario',
    content: (
      <>
        <p className="mb-4">
          Como usuario, puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de los datos, así como retirar el consentimiento otorgado en cualquier momento.
        </p>
        <p className="mb-4">
          Para ejercer tus derechos, escríbenos a:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <a
            href="mailto:naturaleza.s.limites@gmail.com?subject=Ejercicio%20de%20derechos%20RGPD"
            className="text-primary font-medium hover:underline"
          >
            naturaleza.s.limites@gmail.com
          </a>
          <p className="text-sm text-muted-foreground mt-2">
            Indicando en el asunto "Ejercicio de derechos RGPD" y aportando copia de tu documento identificativo.
          </p>
        </div>
        <p>
          Si no obtienes respuesta satisfactoria, tienes derecho a presentar una reclamación ante la{' '}
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Agencia Española de Protección de Datos (AEPD)
          </a>.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '7. Política de cookies',
    content: (
      <p>
        Consulta nuestra política de cookies para conocer qué cookies utilizamos, con qué finalidad y cómo gestionarlas. Puedes modificar tus preferencias de cookies en cualquier momento desde el enlace "Configurar cookies" del pie de página.
      </p>
    ),
  },
  {
    id: 'seguridad',
    title: '8. Seguridad de la información',
    content: (
      <p>
        Aplicamos medidas técnicas y organizativas apropiadas para garantizar la seguridad, confidencialidad, integridad y disponibilidad de tus datos personales, evitando su alteración, pérdida, tratamiento o acceso no autorizado.
      </p>
    ),
  },
  {
    id: 'cambios',
    title: '9. Cambios en la política de privacidad',
    content: (
      <>
        <p className="mb-4">
          Nos reservamos el derecho a actualizar esta Política de Privacidad para adaptarla a novedades legislativas, cambios en nuestros servicios o mejoras en la protección de datos.
        </p>
        <p className="font-medium text-foreground">
          Última actualización: 3 de julio de 2026
        </p>
      </>
    ),
  },
];

export default function Privacidad() {
  return (
    <>
      <Helmet>
        <title>Política de Privacidad | Naturaleza Sin Límites</title>
        <meta
          name="description"
          content="Política de Privacidad de Naturaleza Sin Límites. Conoce cómo protegemos tus datos personales conforme al RGPD y la LOPDGDD."
        />
        <meta property="og:title" content="Política de Privacidad | Naturaleza Sin Límites" />
        <meta
          property="og:description"
          content="Política de Privacidad de Naturaleza Sin Límites. Conoce cómo protegemos tus datos personales conforme al RGPD y la LOPDGDD."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://naturalezasinlimites.com/privacidad" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Política de Privacidad | Naturaleza Sin Límites" />
        <meta
          name="twitter:description"
          content="Política de Privacidad de Naturaleza Sin Límites. Conoce cómo protegemos tus datos personales conforme al RGPD y la LOPDGDD."
        />
        <link rel="canonical" href="https://naturalezasinlimites.com/privacidad" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <ScrollToTop />
        <Navbar />

        <main className="pt-44 md:pt-40 pb-20">
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background pointer-events-none" />
            <div className="container mx-auto px-4 relative">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                  <Shield className="h-4 w-4" />
                  Protección de datos
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Política de <span className="text-primary">Privacidad</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  En Naturaleza Sin Límites tu privacidad es prioridad. Te explicamos cómo tratamos y protegemos tus datos personales conforme al RGPD y la LOPDGDD.
                </p>
              </div>
            </div>
          </section>

          {/* Contact quick cards */}
          <section className="container mx-auto px-4 mb-12">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="mailto:naturaleza.s.limites@gmail.com"
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="text-sm text-foreground truncate">naturaleza.s.limites@gmail.com</p>
                </div>
              </a>
              <a
                href="tel:+34685609542"
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono</p>
                  <p className="text-sm text-foreground">+34 685 60 95 42</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Ubicación</p>
                  <p className="text-sm text-foreground">Málaga, Andalucía, España</p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal content */}
          <section className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8 scroll-mt-32"
                >
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                    {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed space-y-3">
                    {section.content}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Bottom note */}
          <section className="container mx-auto px-4 mt-16">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                Si tienes cualquier duda sobre esta política, puedes contactar con nosotros en{' '}
                <a href="mailto:naturaleza.s.limites@gmail.com" className="text-primary hover:underline">
                  naturaleza.s.limites@gmail.com
                </a>
                .
              </p>
            </div>
          </section>
        </main>

        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}
