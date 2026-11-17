import { media } from "@/data/media";

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
  | "tecnicas-seguridad"
  | "rutas-recomendadas"
  | "equipo-material"
  | "formacion"
  | "historias-experiencias"
  | "consejos-principiantes";

export const categoryLabels: Record<BlogCategory, string> = {
  "tecnicas-seguridad": "Técnicas y Seguridad",
  "rutas-recomendadas": "Rutas Recomendadas",
  "equipo-material": "Equipo y Material",
  formacion: "Formación",
  "historias-experiencias": "Historias y Experiencias",
  "consejos-principiantes": "Consejos para Principiantes",
};

export const categoryColors: Record<BlogCategory, string> = {
  "tecnicas-seguridad": "bg-blue-500 text-white",
  "rutas-recomendadas": "bg-green-600 text-white",
  "equipo-material": "bg-adventure-orange text-white",
  formacion: "bg-purple-600 text-white",
  "historias-experiencias": "bg-teal-500 text-white",
  "consejos-principiantes": "bg-amber-500 text-white",
};

const defaultAuthor: BlogAuthor = {
  name: "Antonio Ruiz Aguilera",
  avatar: "/images/avatar-antonio.webp",
  bio: "Fundador de Naturaleza Sin Límites y Técnico Deportivo TD2 en Espeleología. Comparte experiencias de aventura y formación con un enfoque cercano y responsable.",
  socialLinks: {
    instagram: "https://instagram.com/naturaleza.sinlimites",
  },
};

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Guía Completa: Tu Primer Descenso de Barrancos en Málaga",
    slug: "guia-completa-primer-descenso-barrancos-malaga",
    excerpt:
      "Descubre todo lo que necesitas saber antes de lanzarte a tu primera aventura de barranquismo. Desde el equipo esencial hasta las técnicas básicas de rappel.",
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

### Río Guadalmina
En Benahavís, el catálogo ofrece una salida de iniciación de 2-3 horas. El guía confirma la adecuación al grupo y las condiciones antes de la salida.

### Sima del Diablo
En Júzcar, el catálogo ofrece una salida de iniciación de 2-3 horas con progresión por cuerda. Consulta los requisitos de participación antes de reservar.

## Consejos Finales

1. **Escucha siempre a tu guía**: Su experiencia es tu mejor garantía de seguridad
2. **Comunica tus miedos**: Si algo te genera ansiedad, dilo. Hay alternativas para casi todo
3. **Hidrátate bien**: Aunque estés en el agua, tu cuerpo necesita hidratación
4. **Disfruta del momento**: Deja el móvil en el coche y vive la experiencia al 100%

## ¿Listo para la Aventura?

El barranquismo es una actividad que engancha desde el primer momento. La combinación de naturaleza, aventura y superación personal crea una experiencia inolvidable.

En Naturaleza Sin Límites te acompañamos en cada paso, garantizando una experiencia segura y memorable. ¿Te atreves a descubrir el mundo vertical?
    `,
    featuredImage: media.canyoning.src,
    category: "consejos-principiantes",
    tags: ["barranquismo", "principiantes", "málaga", "guía"],
    author: defaultAuthor,
    publishedAt: "2024-01-15",
    readTime: 8,
    views: 1520,
    seo: {
      metaTitle: "Guía Completa: Tu Primer Descenso de Barrancos en Málaga | Naturaleza Sin Límites",
      metaDescription:
        "Todo lo que necesitas saber para tu primera experiencia de barranquismo en Málaga. Equipo, técnicas, mejores barrancos para principiantes y consejos de expertos.",
      ogImage: media.canyoning.src,
    },
  },
  {
    id: "2",
    title: "¿Qué es una vía ferrata? Guía sencilla para entenderla",
    slug: "5-vias-ferratas-mas-espectaculares-andalucia",
    excerpt:
      "Una vía ferrata es un itinerario equipado en la roca: te contamos qué lleva, cómo te aseguras al cable de vida, qué significa el grado K y qué nivel te corresponde.",
    content: `
## Qué es una vía ferrata

Una vía ferrata es un itinerario que discurre por la roca y que ya está equipado para poder progresar sin tener que escalar de cero: la pared lleva fijados peldaños o grapas metálicas, y a lo largo de todo el recorrido corre un cable de vida de acero. Avanzas trepando y apoyándote en esos peldaños, sujeto al cable con tu arnés y un disipador de energía, de modo que un resbalón queda retenido por la línea de vida.

Es un punto intermedio entre un sendero y la escalada: no necesitas saber escalar ni tener experiencia previa, pero sí moverte por la vertical con calma y seguir las indicaciones del guía.

## Qué lleva equipado el recorrido

- **Grapas y peldaños**: piezas metálicas clavadas en la roca para apoyar pies y manos
- **Cable de vida**: una línea de acero continua que recorre toda la vía
- **Mosquetones y disipador**: las piezas con las que te enganchas al cable
- **Elementos añadidos**: según la ruta, puentes, pasamanos o tirolinas

## Cómo te aseguras

Antes de empezar, el guía repasa el equipo y su uso: casco, arnés y disipador de energía con dos mosquetones. La regla es sencilla: siempre hay un mosquetón enganchado al cable, y se cambian de anclaje de uno en uno. Así, en ningún momento quedas suelto.

## La escala K: qué significa el número

Las vías ferratas se clasifican con la escala Hüsler, de **K1 a K6**. El número indica la dificultad del recorrido. K1 y K2 son itinerarios sencillos, con poca pendiente y exposición reducida. K3 y K4 suman tramos verticales seguidos, puentes y más altura sobre el vacío. K5 y K6 requieren experiencia, brazos fuertes y tolerar bien la altura.

En nuestro catálogo trabajamos rutas de K2 a K5, repartidas por Málaga y el resto de Andalucía.

## Los tres niveles que ofrecemos

| Nivel | Grados | Para quién |
|-------|--------|------------|
| Iniciación | K1–K2 | Sin experiencia previa; niños desde 10 años |
| Intermedio | K3–K4 | Quien ya ha hecho una ferrata de iniciación |
| Avanzado | K5–K6 | Con experiencia previa y buena condición física |

## Qué necesitas y quién puede hacerla

- **Sin experiencia**: el nivel de iniciación está pensado para empezar desde cero
- **Edad mínima**: desde 10 años en iniciación
- **Condición física**: básica en iniciación; media o alta según el nivel
- **Altura**: si te cuesta el vacío, empieza por una ruta de baja exposición

## Diferencia con un sendero de pasarelas

No todo camino colgado de un risco es una vía ferrata. Un sendero de pasarelas, como el Caminito del Rey, se recorre andando por un camino con barandilla, sin arnés ni cable de vida y sin clasificación K. En una ferrata sí te aseguras al cable y trepas por la roca.

## Antes de reservar

Revisa la clasificación y los requisitos de la ruta que te interesa: no todas son para el mismo nivel. Si es tu primera vez, lo más cómodo es contratar la jornada guiada, que incluye el equipo, el repaso previo y el acompañamiento durante todo el recorrido.

Puedes ver todas las opciones en [vías ferratas](/vias-ferratas) o escribirnos por WhatsApp y te decimos qué nivel encaja contigo.
    `,
    featuredImage: media.ferrata.src,
    category: "formacion",
    tags: ["vías ferratas", "iniciación", "montaña", "seguridad"],
    author: defaultAuthor,
    publishedAt: "2024-01-08",
    readTime: 3,
    views: 2340,
    seo: {
      metaTitle: "¿Qué es una vía ferrata? Definición sencilla | Naturaleza Sin Límites",
      metaDescription:
        "Qué es una vía ferrata, qué equipo lleva el recorrido, cómo te aseguras al cable de vida, qué significa la escala K de dificultad y qué nivel te corresponde.",
      ogImage: media.ferrata.src,
    },
  },
  {
    id: "3",
    title: "Técnicas de Rappel: Del Básico al Avanzado",
    slug: "tecnicas-rappel-basico-avanzado",
    excerpt:
      "Dominar el rappel es fundamental para muchas actividades de montaña. Aprende las técnicas esenciales, errores comunes y cómo progresar hacia maniobras más complejas.",
    content: `
## El Arte del Descenso Controlado

El rappel, o rápel, es una técnica fundamental en el mundo de los deportes de aventura. Ya sea para espeleología, barranquismo, escalada o rescate, dominar esta habilidad te abrirá las puertas a un sinfín de aventuras.

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

## Formación para maniobras avanzadas

Los bloqueos, las reuniones intermedias y las maniobras de rescate requieren formación práctica supervisada y procedimientos específicos para cada descensor y cuerda. Este artículo es orientativo y no describe un montaje que permita soltarse de la cuerda ni realizar una maniobra por cuenta propia.

Consulta las instrucciones del fabricante del equipo y aprende estas maniobras con un profesional cualificado antes de utilizarlas en el medio natural.

## Errores Comunes a Evitar

### Error 1: Soltar la mano de frenado
**Consecuencia**: Pérdida total de control
**Solución**: Mantén el control de la cuerda de frenado conforme a las instrucciones del fabricante y la supervisión del guía.

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
3. **Práctica supervisada**: Utiliza instalaciones y sistemas de seguridad adecuados bajo supervisión profesional.
4. **Revisión del equipo**: Consulta las instrucciones del fabricante antes de cada práctica.

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
    featuredImage: media.ropeDetail.src,
    category: "tecnicas-seguridad",
    tags: ["rappel", "técnicas", "seguridad", "formación"],
    author: defaultAuthor,
    publishedAt: "2024-01-02",
    readTime: 12,
    views: 1890,
    seo: {
      metaTitle: "Técnicas de Rappel: Del Básico al Avanzado | Naturaleza Sin Límites",
      metaDescription:
        "Guía completa de técnicas de rappel para todos los niveles. Aprende posición correcta, errores comunes, y progresa desde rappel básico hasta extraplomo.",
      ogImage: media.ropeDetail.src,
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
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
};
