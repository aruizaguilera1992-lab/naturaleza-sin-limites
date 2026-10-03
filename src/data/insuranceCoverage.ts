/**
 * Coberturas de seguro contrastadas el 03/10/2026 con las pólizas aportadas
 * por el titular (no se publican los contratos).
 * - RC 1500175606 (W. R. Berkley), página 10 de la póliza.
 * - Accidentes 1300013109 (W. R. Berkley), tabla pág. 5, precisiones pág. 6,
 *   condiciones particulares pág. 4 (restricciones a partir de 66 años).
 * Normativa: art. 23.1.a Decreto 20/2002, redacción dada por el Decreto 26/2018
 * (DF 1ª.3). No se cita la redacción original de 2002 (derogada en ese punto).
 * Esto NO es un certificado de cumplimiento ni acredita el pago de primas.
 */

export const COVERAGE_CHECKED_LABEL = 'Datos contrastados con las pólizas aportadas · 03/10/2026';
export const POLICY_PERIOD = '18/09/2026 – 17/09/2027';

export const NORMATIVE_SOURCE = {
  label: 'Normativa de turismo activo (Junta de Andalucía)',
  url: 'https://ws040.juntadeandalucia.es/sedeboja/lconsolidada/eli/es-an/d/2002/01/29/20/con/20180208/spa/html/LE0000166864_20180208.html',
  boja: 'https://www.juntadeandalucia.es/boja/2018/27/1.html',
};

export const NORMATIVE_REQUIREMENT =
  'Seguro de responsabilidad profesional permanente y adecuado al riesgo, con un mínimo de 600.000 € por siniestro, que cubra las responsabilidades frente a destinatarios y terceros, incluidos rescate, traslado y asistencia derivados de accidente (art. 23.1.a Decreto 20/2002, redacción Decreto 26/2018).';

export const RC_ROWS: { label: string; value: string }[] = [
  { label: 'RC de explotación', value: '1.000.000 € por siniestro y por año' },
  { label: 'Límite agregado de todas las garantías', value: '1.000.000 € anual' },
  { label: 'Sublímite por víctima', value: '300.000 €' },
  { label: 'Defensa jurídica y fianzas', value: 'Contratada' },
  { label: 'Franquicia general', value: 'Sin franquicia general' },
  { label: 'Daños', value: 'Personales, materiales y perjuicios consecutivos, según contrato' },
];

export const ACCIDENT_ROWS: { label: string; value: string }[] = [
  { label: 'Fallecimiento', value: '3.000 €' },
  { label: 'Incapacidad permanente absoluta / total profesión habitual', value: '6.000 €' },
  { label: 'Incapacidad permanente parcial (según baremo)', value: 'Hasta 6.000 €' },
  { label: 'Asistencia sanitaria', value: 'Hasta 6.000 €' },
  { label: 'Salvamento y rescate', value: 'Hasta 12.000 €' },
];

export const ACCIDENT_NOTES: string[] = [
  'Primera urgencia en centros concertados, con autorización previa de la aseguradora (917 376 342). Libre elección por reembolso, sujeta a valoración y autorización.',
  'El traslado del herido al centro hospitalario o de urgencias más cercano está incluido dentro de los gastos de asistencia sanitaria (no es un capital aparte).',
  'Traslado para continuar tratamiento (a centro prescrito, domicilio o lugar de inicio): sublímite de hasta 1.000 €, incluido en los 6.000 €; no se suma.',
  'La asistencia de urgencia más la asistencia regular no supera 6.000 € en total. Periodo de tratamiento: 12 meses desde el accidente.',
  'Alcance: participantes durante las actividades declaradas y aseguradas, con bonos unipersonales de un día, en ámbito Europa.',
];

export const AGE_RESTRICTION =
  'A partir de 66 años: solo fallecimiento, asistencia sanitaria limitada a 1.500 € en centros concertados y rescate hasta 3.000 €. Sin cobertura de invalidez.';
