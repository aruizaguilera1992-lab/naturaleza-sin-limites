import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '34685609542';
  const message = encodeURIComponent('¡Hola! Me gustaría obtener información sobre vuestras actividades de aventura.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl transition-shadow"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
      
      {/* Pulse Animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </motion.a>
  );
}
