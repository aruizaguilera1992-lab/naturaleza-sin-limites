// Generated from src/data/activityProfiles.ts — server-side source of truth
// for deposit amounts. Prices are per person, in euros, VAT included.

export interface ActivityPriceEntry {
  name: string;
  category: string;
  pricePerPerson: number;
}

export const DEPOSIT_RATE = 0.3;

export const ACTIVITY_PRICES: Record<string, ActivityPriceEntry> = {
  "barranquismo/guadalmina": { name: "Río Guadalmina", category: "Barranquismo", pricePerPerson: 35 },
  "barranquismo/sima-diablo": { name: "Sima del Diablo", category: "Barranquismo", pricePerPerson: 40 },
  "barranquismo/barranco-blanco": { name: "Barranco Blanco", category: "Barranquismo", pricePerPerson: 30 },
  "barranquismo/almanchares": { name: "Río Almanchares", category: "Barranquismo", pricePerPerson: 45 },
  "barranquismo/jorox": { name: "Barranco de Jorox", category: "Barranquismo", pricePerPerson: 45 },
  "barranquismo/moreno": { name: "Barranco Moreno", category: "Barranquismo", pricePerPerson: 50 },
  "barranquismo/arroyo-miel": { name: "Arroyo de la Miel", category: "Barranquismo", pricePerPerson: 50 },
  "barranquismo/cala": { name: "Barranco de la Cala", category: "Barranquismo", pricePerPerson: 50 },
  "barranquismo/huma": { name: "Barranco de Huma", category: "Barranquismo", pricePerPerson: 55 },
  "barranquismo/zarzalones": { name: "Barranco de Zarzalones", category: "Barranquismo", pricePerPerson: 60 },
  "barranquismo/tajo-ronda": { name: "Tajo de Ronda", category: "Barranquismo", pricePerPerson: 55 },
  "barranquismo/buitreras": { name: "Cañón de las Buitreras", category: "Barranquismo", pricePerPerson: 90 },
  "barranquismo/rio-verde": { name: "Río Verde", category: "Barranquismo", pricePerPerson: 55 },
  "barranquismo/rio-lentegi": { name: "Río Lentegí", category: "Barranquismo", pricePerPerson: 45 },
  "barranquismo/trevejo": { name: "Barranco del Trevejo", category: "Barranquismo", pricePerPerson: 40 },
  "barranquismo/poqueira": { name: "Río Poqueira", category: "Barranquismo", pricePerPerson: 65 },
  "barranquismo/lanjaron": { name: "Río Lanjarón", category: "Barranquismo", pricePerPerson: 60 },
  "barranquismo/garganta-verde": { name: "Garganta Verde", category: "Barranquismo", pricePerPerson: 75 },
  "barranquismo/paterna": { name: "Río Paterna", category: "Barranquismo", pricePerPerson: 45 },
  "barranquismo/majales": { name: "Los Majales", category: "Barranquismo", pricePerPerson: 55 },
  "escalada/chorro-frontales": { name: "El Chorro - Sector Frontales", category: "Escalada", pricePerPerson: 49 },
  "escalada/chorro-escalera-arabe": { name: "El Chorro - Escalera Árabe", category: "Escalada", pricePerPerson: 55 },
  "escalada/valle-abdalajis": { name: "Valle de Abdalajís", category: "Escalada", pricePerPerson: 39 },
  "escalada/gaitanes": { name: "Desfiladero de los Gaitanes", category: "Escalada", pricePerPerson: 65 },
  "escalada/torcal-antequera": { name: "El Torcal de Antequera", category: "Escalada", pricePerPerson: 45 },
  "escalada/cahorros": { name: "Los Cahorros", category: "Escalada", pricePerPerson: 42 },
  "escalada/sierra-huetor": { name: "Sierra de Huétor", category: "Escalada", pricePerPerson: 49 },
  "escalada/padul": { name: "El Padul", category: "Escalada", pricePerPerson: 52 },
  "escalada/alfacar": { name: "Alfacar", category: "Escalada", pricePerPerson: 38 },
  "escalada/loja": { name: "Loja - Infiernos", category: "Escalada", pricePerPerson: 55 },
  "escalada/los-vados": { name: "Los Vados", category: "Escalada", pricePerPerson: 42 },
  "escalada/cabra": { name: "Sierra de Cabra", category: "Escalada", pricePerPerson: 38 },
  "escalada/zaframagon": { name: "Peñón de Zaframagón", category: "Escalada", pricePerPerson: 55 },
  "escalada/grazalema": { name: "Sierra de Grazalema", category: "Escalada", pricePerPerson: 45 },
  "escalada/constantina": { name: "Constantina", category: "Escalada", pricePerPerson: 35 },
  "escalada/despeñaperros": { name: "Despeñaperros", category: "Escalada", pricePerPerson: 48 },
  "escalada/cazorla": { name: "Sierra de Cazorla", category: "Escalada", pricePerPerson: 42 },
  "escalada/ardales": { name: "Ardales", category: "Escalada", pricePerPerson: 35 },
  "vias-ferratas/ferrata-el-chorro": { name: "Vía Ferrata El Chorro (Caminito del Rey)", category: "Vía ferrata", pricePerPerson: 55 },
  "vias-ferratas/ferrata-atajate": { name: "Vía Ferrata de Atajate", category: "Vía ferrata", pricePerPerson: 45 },
  "vias-ferratas/ferrata-benadalid": { name: "Vía Ferrata de Benadalid (del Techo)", category: "Vía ferrata", pricePerPerson: 50 },
  "vias-ferratas/ferrata-benalauria": { name: "Vía Ferrata de Benalauría (del Canal)", category: "Vía ferrata", pricePerPerson: 40 },
  "vias-ferratas/ferrata-teba": { name: "Vía Ferrata San Cristóbal (Teba)", category: "Vía ferrata", pricePerPerson: 40 },
  "vias-ferratas/ferrata-gaucin-castillo": { name: "Vía Ferrata Castillo del Águila (Gaucín)", category: "Vía ferrata", pricePerPerson: 45 },
  "vias-ferratas/ferrata-gaucin-hacho": { name: "Vía Ferrata Sierra del Hacho (Gaucín)", category: "Vía ferrata", pricePerPerson: 60 },
  "vias-ferratas/ferrata-tajo-reloj": { name: "Vía Ferrata Tajo del Reloj", category: "Vía ferrata", pricePerPerson: 50 },
  "vias-ferratas/ferrata-montejaque": { name: "Vía Ferrata de Montejaque", category: "Vía ferrata", pricePerPerson: 65 },
  "vias-ferratas/ferrata-turrion-comares": { name: "Vía Ferrata El Turrión (Comares)", category: "Vía ferrata", pricePerPerson: 50 },
  "vias-ferratas/ferrata-bola-hondonero": { name: "Vía Ferrata La Bola (Villanueva del Rosario)", category: "Vía ferrata", pricePerPerson: 40 },
  "vias-ferratas/ferrata-pita-100canos": { name: "Vía Ferrata La Pita (100 Caños)", category: "Vía ferrata", pricePerPerson: 60 },
  "vias-ferratas/ferrata-alfarnatura": { name: "Vía Ferrata Alfarnatura", category: "Vía ferrata", pricePerPerson: 35 },
  "vias-ferratas/ferrata-archidona": { name: "Vía Ferrata de Archidona (Virgen de Gracia)", category: "Vía ferrata", pricePerPerson: 50 },
  "vias-ferratas/ferrata-tajo-ronda-sevillana": { name: "Vía Ferrata Tajo de Ronda I (La Sevillana)", category: "Vía ferrata", pricePerPerson: 45 },
  "vias-ferratas/ferrata-john-hogbin": { name: "Vía Ferrata John Hogbin (Zafarraya)", category: "Vía ferrata", pricePerPerson: 65 },
  "vias-ferratas/ferrata-cueva-hora-loja": { name: "Vía Ferrata Cueva Horá (Loja)", category: "Vía ferrata", pricePerPerson: 60 },
  "vias-ferratas/ferrata-colmena-quentar": { name: "Vía Ferrata La Colmena (Quéntar)", category: "Vía ferrata", pricePerPerson: 55 },
  "vias-ferratas/ferrata-barranco-luna": { name: "Vía Ferrata Barranco de la Luna (Saleres)", category: "Vía ferrata", pricePerPerson: 45 },
  "vias-ferratas/ferrata-tajo-vinas": { name: "Vía Ferrata Tajo de las Viñas (Lentegí)", category: "Vía ferrata", pricePerPerson: 50 },
  "vias-ferratas/ferrata-benaojan": { name: "Vía Ferrata de Benaoján", category: "Vía ferrata", pricePerPerson: 45 },
  "vias-ferratas/ferrata-zuheros": { name: "Vía Ferrata de Zuheros", category: "Vía ferrata", pricePerPerson: 40 },
  "vias-ferratas/ferrata-estrella-espiel": { name: "Vía Ferrata La Estrella (Espiel)", category: "Vía ferrata", pricePerPerson: 40 },
  "vias-ferratas/ferrata-castala": { name: "Vía Ferrata Castala (Berja)", category: "Vía ferrata", pricePerPerson: 70 },
  "vias-ferratas/ferrata-carcauz-vicar": { name: "Vía Ferrata Barranco de Carcauz (Vícar)", category: "Vía ferrata", pricePerPerson: 60 },
  "vias-ferratas/ferrata-castillo-locubin": { name: "Vía Ferrata Castillo de Locubín", category: "Vía ferrata", pricePerPerson: 40 },
  "vias-ferratas/ferrata-monte-hacho": { name: "Vía Ferrata Monte Hacho (Lora de Estepa)", category: "Vía ferrata", pricePerPerson: 40 },
};

export const getActivityPrice = (category: string, slug: string) =>
  ACTIVITY_PRICES[`${category}/${slug}`];
