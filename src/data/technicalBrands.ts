/**
 * Marcas de equipamiento técnico (según la hoja de presupuesto del titular).
 * Es una lista de marcas, NO acredita compra completa, patrocinio ni acuerdo.
 *
 * Logotipos descargados sin modificar de las webs oficiales de cada fabricante
 * (procedencia exacta en `logoSource`, página en `logoPage`; descarga 03/10/2026).
 * `plate`: fondo de la placa para que el logo original se lea sobre el tema oscuro.
 */
export interface TechnicalBrand {
  name: string;
  logo: string;
  website: string;
  logoPage: string;
  logoSource: string;
  plate: 'light' | 'dark';
}

export const technicalBrands: TechnicalBrand[] = [
  { name: 'Petzl', logo: '/images/brands/oficial/petzl.png', website: 'https://www.petzl.com', logoPage: 'https://www.petzl.com/ES/es', logoSource: 'https://www.petzl.com/resource/1756816274000/Petzl_Front/static/img/petzl-logo.png', plate: 'dark' },
  // Rock Stone es un modelo de Fixe (catálogo oficial https://www.fixeclimbing.com/img/cms/cat-2022-fixe.pdf), no una marca aparte.
  { name: 'Fixe', logo: '/images/brands/oficial/fixe.svg', website: 'https://www.fixeclimbing.com', logoPage: 'https://www.fixeclimbing.com/es/', logoSource: 'https://www.fixeclimbing.com/img/logo-1780305876.svg', plate: 'light' },
  { name: 'Edelrid', logo: '/images/brands/oficial/edelrid.svg', website: 'https://edelrid.com', logoPage: 'https://edelrid.com/eu-en', logoSource: 'https://edelrid.com/bundles/rrooaarredelridtheme/images/logo-edelrid.svg', plate: 'light' },
  { name: 'Beal', logo: '/images/brands/oficial/beal.svg', website: 'https://www.beal-planet.com', logoPage: 'https://www.beal-planet.com/', logoSource: 'https://www.beal-planet.com/cdn/shop/files/logo-default.svg?v=1714730554', plate: 'dark' },
  { name: 'Lifesystems', logo: '/images/brands/oficial/lifesystems.png', website: 'https://www.lifesystems.co.uk', logoPage: 'https://www.lifesystems.co.uk/', logoSource: 'https://www.lifesystems.co.uk/cdn/shop/files/ls-header-logo-mouseover_16071b90-9f51-4d2b-a0fe-f163cdeb775d.png?v=1700066562', plate: 'light' },
  { name: 'Velilla', logo: '/images/brands/oficial/velilla.png', website: 'https://www.velilla-group.com', logoPage: 'https://www.velilla-group.com/es/velilla', logoSource: 'https://www.velilla-group.com/img/redesign/brands/velilla.png', plate: 'light' },
  // El dominio oficial de Korda's es sacidkordas.com (kordas.com no pertenece al fabricante).
  { name: 'Korda’s', logo: '/images/brands/oficial/kordas.png', website: 'https://sacidkordas.com', logoPage: 'https://sacidkordas.com/es/', logoSource: 'https://sacidkordas.com/wp-content/uploads/2024/11/Logo-Kordas-Negro-2024-menys-px.png', plate: 'light' },
  { name: 'Seland', logo: '/images/brands/oficial/seland.png', website: 'https://seland.com', logoPage: 'https://seland.com/', logoSource: 'https://seland.com/wp-content/uploads/2022/12/cropped-seland-logo.png', plate: 'light' },
  { name: 'Rodcle', logo: '/images/brands/oficial/rodcle.png', website: 'https://www.rodcle.com', logoPage: 'https://www.rodcle.com/', logoSource: 'https://www.rodcle.com/wp-content/uploads/2016/07/Rodcle-logo.png', plate: 'light' },
  { name: 'Aventure Verticale', logo: '/images/brands/oficial/aventure-verticale.svg', website: 'https://www.aventureverticale.com', logoPage: 'https://www.aventureverticale.com/', logoSource: 'https://www.aventureverticale.com/wp-content/uploads/2022/12/logo-aventure-verticale.svg', plate: 'light' },
];
