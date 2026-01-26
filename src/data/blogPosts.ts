export interface BlogAuthor {
  name: string;
  avatar: string;
  bio: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: BlogCategory;
  tags: string[];
  author: BlogAuthor;
  publishedAt: string;
  readTime: number;
  views?: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
}

export type BlogCategory = 
  | 'tecnicas-seguridad'
  | 'rutas-recomendadas'
  | 'equipo-material'
  | 'formacion'
  | 'historias-experiencias'
  | 'consejos-principiantes';

export const categoryLabels: Record<BlogCategory, string> = {
  'tecnicas-seguridad': 'Técnicas y Seguridad',
  'rutas-recomendadas': 'Rutas Recomendadas',
  'equipo-material': 'Equipo y Material',
  'formacion': 'Formación',
  'historias-experiencias': 'Historias y Experiencias',
  'consejos-principiantes': 'Consejos para Principiantes',
};

export const categoryColors: Record<BlogCategory, string> = {
  'tecnicas-seguridad': 'bg-blue-500 text-white',
  'rutas-recomendadas': 'bg-green-600 text-white',
  'equipo-material': 'bg-adventure-orange text-white',
  'formacion': 'bg-purple-600 text-white',
  'historias-experiencias': 'bg-teal-500 text-white',
  'consejos-principiantes': 'bg-amber-500 text-white',
};

const defaultAuthor: BlogAuthor = {
  name: 'Antonio García',
  avatar: '/placeholder.svg',
  bio: 'Guía profesional de montaña con más de 15 años de experiencia en espeleología, barranquismo y escalada. Fundador de Naturaleza Sin Límites y apasionado por compartir el conocimiento de los deportes de aventura.',
  socialLinks: {
    instagram: 'https://instagram.com/naturalezasinlimites',
    facebook: 'https://facebook.com/naturalezasinlimites',
  },
};

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Guía Completa: Tu Primer Descenso de Barrancos en Málaga',
    slug: 'guia-completa-primer-descenso-barrancos-malaga',
    excerpt: 'Descubre todo lo que necesitas saber antes de lanzarte a tu primera aventura de barranquismo. Desde el equipo esencial hasta las técnicas básicas de rappel.',
    content: `
## Introducción al Barranquismo

El barranquismo, también conocido como canyoning, es una de las actividades más emocionantes que puedes experimentar en la naturaleza. Combina senderismo, natación, saltos y rappel en un entorno espectacular de cañones y cascadas.

En Málaga tenemos la suerte de contar con algunos de los mejores barrancos de Andalucía, con opciones para todos los niveles de experiencia.

## ¿Qué Esperar en tu Primera Aventura?

Antes de adentrarte en tu primer barranco, es importante entender qué vas a experimentar:

- **Toboganes naturales**: Deslizarte por la roca pulida por el agua durante miles de años
- **Saltos al agua**: Desde pequeños saltos de 2 metros hasta grandes saltos opcionales
- **Rappel en cascadas**: Descender por cuerdas mientras el agua cae a tu alrededor
- **Natación en pozas**: Atravesar pozas de agua cristalina entre paredes de roca

> "El barranquismo te conecta con la naturaleza de una forma que pocas actividades pueden igualar. Es adrenalina pura combinada con paisajes de ensueño."

## El Equipo Esencial

Para una experiencia segura y cómoda, necesitarás:

### Equipo que Proporcionamos

1. **Neopreno completo**: Te mantiene caliente en el agua y te protege de roces
2. **Casco de seguridad**: Homologado para actividades acuáticas
3. **Arnés de barranquismo**: Diseñado específicamente para esta actividad
4. **Cabos de anclaje**: Para asegurarte durante los rappeles

### Lo que Debes Traer

- Bañador o ropa interior de recambio
- Escarpines o zapatillas que se puedan mojar (nosotros proporcionamos si no tienes)
- Toalla y ropa seca para después
- Agua y algo de comer para el camino

## Técnicas Básicas que Aprenderás

Durante la actividad, nuestros guías te enseñarán las técnicas fundamentales:

| Técnica | Descripción | Nivel |
|---------|-------------|-------|
| Rappel básico | Descenso controlado por cuerda | Fácil |
| Salto seguro | Técnica correcta de salto al agua | Fácil |
| Tobogán | Posición correcta para deslizarte | Fácil |
| Natación en corriente | Cómo nadar con el neopreno | Medio |

## Los Mejores Barrancos para Principiantes en Málaga

### Barranco de la Rejía
Ubicado en El Chorro, es perfecto para iniciarse. Tiene rappeles cortos, saltos opcionales y toboganes divertidos. Duración aproximada de 3-4 horas.

### Barranco de las Buitreras (Nivel I)
En la Serranía de Ronda, ofrece una experiencia más completa pero accesible. Las vistas son espectaculares y el agua suele estar más templada.

## Consejos Finales

1. **Escucha siempre a tu guía**: Su experiencia es tu mejor garantía de seguridad
2. **Comunica tus miedos**: Si algo te genera ansiedad, dilo. Hay alternativas para casi todo
3. **Hidrátate bien**: Aunque estés en el agua, tu cuerpo necesita hidratación
4. **Disfruta del momento**: Deja el móvil en el coche y vive la experiencia al 100%

## ¿Listo para la Aventura?

El barranquismo es una actividad que engancha desde el primer momento. La combinación de naturaleza, aventura y superación personal crea una experiencia inolvidable.

En Naturaleza Sin Límites te acompañamos en cada paso, garantizando una experiencia segura y memorable. ¿Te atreves a descubrir el mundo vertical?
    `,
    featuredImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
    category: 'consejos-principiantes',
    tags: ['barranquismo', 'principiantes', 'málaga', 'guía'],
    author: defaultAuthor,
    publishedAt: '2024-01-15',
    readTime: 8,
    views: 1520,
    seo: {
      metaTitle: 'Guía Completa: Tu Primer Descenso de Barrancos en Málaga | Naturaleza Sin Límites',
      metaDescription: 'Todo lo que necesitas saber para tu primera experiencia de barranquismo en Málaga. Equipo, técnicas, mejores barrancos para principiantes y consejos de expertos.',
      ogImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
    },
  },
  {
    id: '2',
    title: 'Las 5 Vías Ferratas más Espectaculares de Andalucía',
    slug: '5-vias-ferratas-mas-espectaculares-andalucia',
    excerpt: 'Recorremos las vías ferratas más impresionantes del sur de España. Desde el mítico Caminito del Rey hasta joyas ocultas que solo conocen los locales.',
    content: `
## El Auge de las Vías Ferratas en Andalucía

Las vías ferratas han experimentado un boom en los últimos años, y Andalucía se ha convertido en uno de los destinos más atractivos de España para practicar esta actividad. La combinación de paisajes espectaculares, buen clima durante casi todo el año y una creciente oferta de rutas equipadas hace de nuestra región un paraíso para los amantes de la aventura vertical.

## ¿Qué es una Vía Ferrata?

Para los no iniciados, una vía ferrata es un itinerario vertical u horizontal equipado con:

- **Peldaños y grapas**: Clavados en la roca para facilitar la progresión
- **Cable de vida**: Una línea de acero continua para asegurarte
- **Puentes colgantes**: En algunas rutas, añaden emoción extra

> "Las vías ferratas democratizan la montaña, permitiendo a personas sin experiencia en escalada disfrutar de la verticalidad."

## Las 5 Imprescindibles

### 1. Caminito del Rey - El Chorro, Málaga

Sin duda la más famosa. Aunque técnicamente es una pasarela y no una vía ferrata tradicional, merece el primer puesto por su historia y espectacularidad.

**Datos clave:**
- Longitud: 7.7 km
- Desnivel: 300 m
- Dificultad: K1 (muy fácil)
- Mejor época: Todo el año

### 2. Vía Ferrata del Tajo de Ronda

Una experiencia única que te permite ver Ronda desde una perspectiva completamente diferente. Pasas literalmente por debajo del Puente Nuevo.

**Datos clave:**
- Longitud: 500 m
- Desnivel: 105 m
- Dificultad: K3 (intermedia)
- Mejor época: Primavera y otoño

### 3. Vía Ferrata de Atajate

Una joya escondida en la Serranía de Ronda. Menos conocida pero igualmente impresionante, con vistas al valle del Genal.

**Datos clave:**
- Longitud: 350 m
- Desnivel: 80 m
- Dificultad: K2 (fácil)
- Mejor época: Todo el año

### 4. Vía Ferrata de El Chorro

Junto al embalse, ofrece una experiencia más técnica con tramos desplomados y un puente tibetano impresionante.

**Datos clave:**
- Longitud: 400 m
- Desnivel: 120 m
- Dificultad: K4 (difícil)
- Mejor época: Primavera y otoño

### 5. Vía Ferrata de la Escalera Árabe - Comares

Una vía ferrata con historia, siguiendo el antiguo acceso al pueblo. Las vistas a la Axarquía son increíbles.

**Datos clave:**
- Longitud: 280 m
- Desnivel: 95 m
- Dificultad: K3 (intermedia)
- Mejor época: Todo el año

## Comparativa Rápida

| Vía Ferrata | Dificultad | Tiempo | Para Principiantes |
|-------------|------------|--------|---------------------|
| Caminito del Rey | K1 | 4h | ✅ Sí |
| Tajo de Ronda | K3 | 2h | ⚠️ Con guía |
| Atajate | K2 | 1.5h | ✅ Sí |
| El Chorro | K4 | 2.5h | ❌ No |
| Comares | K3 | 1.5h | ⚠️ Con guía |

## Preparación y Seguridad

Antes de lanzarte a conquistar estas vías, ten en cuenta:

1. **Formación previa**: Si es tu primera vez, contrata un guía
2. **Equipo adecuado**: Arnés, casco, disipador de energía y mosquetones específicos
3. **Condiciones meteorológicas**: Nunca hagas una ferrata con lluvia o riesgo de tormenta
4. **Condición física**: Aunque no requieren ser atleta, sí demandan resistencia

## La Experiencia con Guía

Realizar estas vías con un guía profesional te permite:

- Aprender las técnicas correctas desde el principio
- Conocer la historia y curiosidades de cada ruta
- Tener apoyo en los tramos más exigentes
- Disfrutar sin preocuparte por la logística

## Conclusión

Andalucía ofrece un abanico de posibilidades para disfrutar de las vías ferratas. Desde la accesible espectacularidad del Caminito del Rey hasta la técnica exigente de El Chorro, hay opciones para todos los niveles y gustos.

¿Cuál será tu próxima aventura vertical?
    `,
    featuredImage: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200',
    category: 'rutas-recomendadas',
    tags: ['vías ferratas', 'andalucía', 'rutas', 'aventura'],
    author: defaultAuthor,
    publishedAt: '2024-01-08',
    readTime: 10,
    views: 2340,
    seo: {
      metaTitle: 'Las 5 Vías Ferratas más Espectaculares de Andalucía | Naturaleza Sin Límites',
      metaDescription: 'Descubre las mejores vías ferratas de Andalucía: Caminito del Rey, Tajo de Ronda, Atajate, El Chorro y Comares. Guía completa con dificultad, tiempos y consejos.',
      ogImage: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200',
    },
  },
  {
    id: '3',
    title: 'Técnicas de Rappel: Del Básico al Avanzado',
    slug: 'tecnicas-rappel-basico-avanzado',
    excerpt: 'Dominar el rappel es fundamental para muchas actividades de montaña. Aprende las técnicas esenciales, errores comunes y cómo progresar hacia maniobras más complejas.',
    content: `
## El Arte del Descenso Controlado

El rappel, o rápel, es una técnica fundamental en el mundo de los deportes de montaña. Ya sea para espeleología, barranquismo, escalada o rescate, dominar esta habilidad te abrirá las puertas a un sinfín de aventuras.

## Fundamentos del Rappel

### El Equipo Básico

Para realizar un rappel seguro necesitas:

- **Arnés**: Correctamente ajustado a tu cuerpo
- **Dispositivo de descenso**: Ocho, ATC, o descendedor específico
- **Mosquetón de seguridad**: Con cierre de rosca o automático
- **Casco**: Siempre, sin excepciones
- **Guantes**: Especialmente para descensos largos

> "Un buen rappelista no es el más rápido, sino el que más control mantiene durante todo el descenso."

### La Posición Correcta

La posición del cuerpo es crucial para un descenso controlado:

1. **Pies separados**: A la anchura de los hombros
2. **Piernas semi-flexionadas**: Como si estuvieras sentado en una silla invisible
3. **Cuerpo perpendicular**: A la pared que estás descendiendo
4. **Mano de frenado**: Siempre por debajo de la cadera

## Técnicas Progresivas

### Nivel 1: Rappel Básico en Placa

El primer paso es dominar el descenso en superficies inclinadas pero no verticales:

| Elemento | Descripción |
|----------|-------------|
| Inclinación | 45-60 grados |
| Control de velocidad | Con mano de frenado |
| Movimiento de pies | Pasos cortos y controlados |
| Mirada | Hacia abajo, observando el terreno |

### Nivel 2: Rappel Vertical

Una vez dominada la placa, pasamos a paredes verticales:

- Mantén el cuerpo más horizontal
- Los pies planos contra la pared
- Impulsos cortos y controlados
- La cuerda siempre tensa

### Nivel 3: Rappel en Extraplomo

El más desafiante, donde la pared está inclinada hacia ti:

1. **Separación inicial**: Antes de pasar el borde, separa bien el cuerpo
2. **Control absoluto**: Nunca sueltes la mano de frenado
3. **Uso del cuerpo**: Gira ligeramente para ver dónde pisas
4. **Paciencia**: Los movimientos deben ser más lentos y controlados

## Técnicas Avanzadas

### Rappel Guiado

Ideal para principiantes o situaciones de rescate:

- Un segundo operador controla la cuerda desde abajo
- Añade una capa extra de seguridad
- Permite comunicación constante

### Rappel Doble con Reunión

Para grandes paredes con múltiples largos:

- Monta una reunión intermedia
- Recupera las cuerdas
- Continúa hacia el siguiente anclaje

### Auto-bloqueo de Emergencia

Una técnica crucial que todo rappelista debe dominar:

1. Crea una gaza con la cuerda bajo el dispositivo
2. Pásala por el mosquetón de seguridad
3. El sistema se bloquea al soltar las manos
4. Úsalo si necesitas liberarte para cualquier maniobra

## Errores Comunes a Evitar

### Error 1: Soltar la mano de frenado
**Consecuencia**: Pérdida total de control
**Solución**: Practica el bloqueo automático

### Error 2: Velocidad excesiva
**Consecuencia**: Quemaduras en la cuerda, pérdida de control
**Solución**: Descensos pausados, especialmente al principio

### Error 3: Cuerda mal montada
**Consecuencia**: Riesgo de caída
**Solución**: Siempre verifica dos veces antes de cargar peso

### Error 4: Pelo o ropa sueltos
**Consecuencia**: Atrapamiento en el dispositivo
**Solución**: Recoge siempre el pelo y ajusta la ropa

## Practica en Entorno Controlado

Antes de lanzarte a la montaña real:

1. **Rocódromos**: Muchos tienen zonas de práctica de rappel
2. **Cursos de iniciación**: Con profesionales que corrigen errores
3. **Muros bajos**: Practica primero donde una caída no sea grave
4. **Simulaciones**: En casa puedes practicar los nudos y montajes

## El Rappel en Diferentes Disciplinas

### En Espeleología
- Cuerdas estáticas
- Descensos muy verticales
- Oscuridad y humedad añaden dificultad

### En Barranquismo
- Rappeles con agua
- Superficies resbaladizas
- A veces, rappeles saltados

### En Escalada
- Rappeles de recuperación de rutas
- A menudo en extraplomo
- Importancia de no perder material

## Conclusión

El rappel es una habilidad que se perfecciona con la práctica constante. Comienza siempre con supervisión profesional, respeta los protocolos de seguridad y progresa gradualmente hacia técnicas más avanzadas.

Recuerda: en la montaña, la prisa es enemiga de la seguridad. Tómate tu tiempo para hacer cada rappel de forma correcta.
    `,
    featuredImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
    category: 'tecnicas-seguridad',
    tags: ['rappel', 'técnicas', 'seguridad', 'formación'],
    author: defaultAuthor,
    publishedAt: '2024-01-02',
    readTime: 12,
    views: 1890,
    seo: {
      metaTitle: 'Técnicas de Rappel: Del Básico al Avanzado | Naturaleza Sin Límites',
      metaDescription: 'Guía completa de técnicas de rappel para todos los niveles. Aprende posición correcta, errores comunes, y progresa desde rappel básico hasta extraplomo.',
      ogImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
    },
  },
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

export const getPostsByCategory = (category: BlogCategory): BlogPost[] => {
  return blogPosts.filter((post) => post.category === category);
};

export const getRelatedPosts = (currentPost: BlogPost, limit: number = 3): BlogPost[] => {
  return blogPosts
    .filter((post) => post.id !== currentPost.id)
    .filter((post) => post.category === currentPost.category || post.tags.some((tag) => currentPost.tags.includes(tag)))
    .slice(0, limit);
};

export const getMostReadPosts = (limit: number = 5): BlogPost[] => {
  return [...blogPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
};

export const searchPosts = (query: string): BlogPost[] => {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};
