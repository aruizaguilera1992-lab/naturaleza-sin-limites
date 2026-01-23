import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Mail, Phone, User, MessageSquare } from 'lucide-react';

interface ContactSubmission {
  id: string;
  nombre: string;
  contacto: string;
  interes: string;
  personas: string | null;
  mensaje: string | null;
  created_at: string;
}

export default function Admin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('No tienes permisos para ver esta información. Por favor, inicia sesión.');
    } finally {
      setLoading(false);
    }
  };

  const getInterestBadgeVariant = (interes: string) => {
    if (interes.includes('aventura')) return 'default';
    if (interes.includes('Entrenamiento')) return 'secondary';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">
                Mensajes recibidos desde el formulario de contacto
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <p className="text-destructive">{error}</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-10 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin mensajes aún</h3>
                <p className="text-muted-foreground">
                  Los mensajes del formulario de contacto aparecerán aquí.
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Fecha</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead className="text-center">Personas</TableHead>
                      <TableHead className="max-w-[300px]">Mensaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium text-sm">
                          {format(new Date(submission.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {submission.nombre}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {submission.contacto.includes('@') ? (
                              <Mail className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Phone className="w-4 h-4 text-muted-foreground" />
                            )}
                            <a 
                              href={submission.contacto.includes('@') 
                                ? `mailto:${submission.contacto}` 
                                : `tel:${submission.contacto}`}
                              className="text-primary hover:underline"
                            >
                              {submission.contacto}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getInterestBadgeVariant(submission.interes)}>
                            {submission.interes}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {submission.personas || '-'}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm text-muted-foreground truncate">
                            {submission.mensaje || '-'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
