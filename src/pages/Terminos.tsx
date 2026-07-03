import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { FileText, Mail, Phone } from 'lucide-react';

const sections = [
  {
    id: 'identificacion',
    title: '1. Identificación y objeto',
    content: (
      <>
        <p className="mb-4">
          El presente sitio web es operado por <strong className="text-foreground">Naturaleza Sin Límites</strong>, un proyecto personal de guiado y entrenamiento en deportes de aventura con sede en Málaga, Andalucía, España.
        </p>
        <p className="mb-4">
          Puedes contactar con nosotros a través de:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            Email:{' '}
            <a href="mailto:naturaleza.s.limites@gmail.com" className="text-primary hover:underline">
              naturaleza.s.limites@gmail.com
            </a>
          </li>
          <li>
            Teléfono:{' '}
            <a href="tel:+34685609542" className="text-primary hover:underline">
              +34 685 60 95 42
            </a>
          </li>
        </ul>
        <p className="mt-4">
          Estos Términos y Condiciones regulan el acceso, navegación y uso del sitio web, así como la contratación de las actividades de aventura y servicios de entrenamiento ofrecidos.
        </p>
      </>
    ),
  },
  {
    id: 'reservas',
    title: '2. Condiciones de reserva',
    content: (
      <>
        <p className="mb-4">
          La contratación de actividades y servicios de entrenamiento se rige por las siguientes condiciones:
        </p>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            La reserva se formaliza tras el contacto previo —vía formulario web, email, teléfono o WhatsApp— y la confirmación expresa por parte de Naturaleza Sin Límites.
          </li>
          <li>
            Para confirmar la plaza es necesario abonar el importe total de la actividad o la señal acordada previamente.
          </li>
          <li>
            La edad mínima para participar es de <strong>14 años</strong>. Los menores de edad deberán contar con autorización expresa del tutor legal y estar acompañados por él durante la actividad.
          </li>
          <li>
            El número máximo de participantes por grupo es de <strong>6 personas</strong>, garantizando así una atención personalizada y segura.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'cancelaciones',
    title: '3. Cancelaciones y devoluciones',
    content: (
      <>
        <p className="mb-4">
          Aplicamos la siguiente política de cancelación:
        </p>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            <strong className="text-foreground">Cancelación por el cliente con más de 7 días de antelación:</strong> devolución del 100% del importe abonado.
          </li>
          <li>
            <strong className="text-foreground">Cancelación con menos de 7 días de antelación:</strong> se retendrá el 50% del importe en concepto de gastos de gestión.
          </li>
          <li>
            <strong className="text-foreground">Cancelación con menos de 48 horas o no presentación:</strong> no procederá devolución.
          </li>
          <li>
            <strong className="text-foreground">Cancelación por causas meteorológicas o de seguridad:</strong> si el guía considera que las condiciones no son seguras, se ofrecerá la devolución total del importe o el cambio de fecha sin coste adicional.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'requisitos',
    title: '4. Requisitos de participación y seguridad',
    content: (
      <>
        <p className="mb-4">
          La seguridad de los participantes es nuestra máxima prioridad. Al contratar una actividad, el participante acepta las siguientes condiciones:
        </p>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            El participante debe declarar fielmente su estado de salud y no padecer contraindicaciones médicas para la realización de la actividad (problemas cardíacos, respiratorios, de equilibrio, etc.).
          </li>
          <li>
            El material técnico homologado necesario para la actividad será proporcionado por Naturaleza Sin Límites, salvo acuerdo previo en contrario.
          </li>
          <li>
            El participante se compromete a seguir en todo momento las instrucciones del guía y las normas de seguridad establecidas.
          </li>
          <li>
            Naturaleza Sin Límites se reserva el derecho de cancelar, modificar o adaptar la actividad si las condiciones de seguridad no son adecuadas, sin derecho a indemnización por parte del cliente.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'responsabilidad',
    title: '5. Responsabilidad',
    content: (
      <>
        <p className="mb-4">
          La práctica de deportes de aventura conlleva riesgos inherentes que el participante asume al contratar la actividad. No obstante, trabajamos con guías cualificados, material homologado y protocolos de seguridad para minimizar esos riesgos.
        </p>
        <ul className="space-y-3 list-disc pl-5">
          <li>
            Naturaleza Sin Límites no se responsabiliza de los accidentes derivados de la no observancia de las instrucciones del guía, de la ocultación de problemas de salud o de conductas temerarias por parte del participante.
          </li>
          <li>
            Se recomienda encarecidamente que cada participante cuente con un seguro de accidentes o de responsabilidad civil que cubra la práctica de deportes de aventura.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'propiedad',
    title: '6. Propiedad intelectual',
    content: (
      <p>
        Todos los contenidos del sitio web —textos, fotografías, vídeos, logotipos, diseño gráfico y código— son propiedad de Naturaleza Sin Límites o cuentan con licencia de uso autorizada. Queda prohibida su reproducción, distribución, comunicación pública o transformación total o parcial sin autorización expresa por escrito.
      </p>
    ),
  },
  {
    id: 'proteccion-datos',
    title: '7. Protección de datos',
    content: (
      <p>
        El tratamiento de los datos personales de los usuarios se rige por nuestra{' '}
        <a href="/privacidad" className="text-primary hover:underline">
          Política de Privacidad
        </a>
        , disponible en el sitio web.
      </p>
    ),
  },
  {
    id: 'legislacion',
    title: '8. Legislación aplicable',
    content: (
      <>
        <p className="mb-4">
          Estos Términos y Condiciones se rigen por la legislación española vigente.
        </p>
        <p>
          Para la resolución de cualquier controversia que pudiera derivarse del acceso al sitio web o de la contratación de servicios, las partes se someten a los Juzgados y Tribunales de Málaga capital, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
        </p>
      </>
    ),
  },
  {
    id: 'actualizacion',
    title: '9. Actualización',
    content: (
      <>
        <p className="mb-4">
          Naturaleza Sin Límites se reserva el derecho a modificar estos Términos y Condiciones en cualquier momento para adaptarlos a cambios legislativos, operativos o en la oferta de servicios.
        </p>
        <p className="font-medium text-foreground">
          Última actualización: 3 de julio de 2026
        </p>
      </>
    ),
  },
];

export default function Terminos() {
  return (
    <>
      <Helmet>
        <title>Términos y Condiciones | Naturaleza Sin Límites</title>
        <meta
          name="description"
          content="Términos y Condiciones de Naturaleza Sin Límites. Reservas, cancelaciones, seguridad, responsabilidad y legislación aplicable."
        />
        <meta property="og:title" content="Términos y Condiciones | Naturaleza Sin Límites" />
        <meta
          property="og:description"
          content="Términos y Condiciones de Naturaleza Sin Límites. Reservas, cancelaciones, seguridad, responsabilidad y legislación aplicable."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://naturalezasinlimites.com/terminos" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Términos y Condiciones | Naturaleza Sin Límites" />
        <meta
          name="twitter:description"
          content="Términos y Condiciones de Naturaleza Sin Límites. Reservas, cancelaciones, seguridad, responsabilidad y legislación aplicable."
        />
        <link rel="canonical" href="https://naturalezasinlimites.com/terminos" />
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
                  <FileText className="h-4 w-4" />
                  Condiciones de uso
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Términos y <span className="text-primary">Condiciones</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Lee atentamente las condiciones de reserva, participación y uso del sitio web de Naturaleza Sin Límites.
                </p>
              </div>
            </div>
          </section>

          {/* Contact quick cards */}
          <section className="container mx-auto px-4 mb-12">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Para cualquier duda sobre estas condiciones, escríbenos a{' '}
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
