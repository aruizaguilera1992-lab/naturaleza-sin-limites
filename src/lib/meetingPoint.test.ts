import { describe, expect, it } from 'vitest';
import { appleMapsUrl, extractUrl, googleMapsUrl, textWithoutUrl } from './meetingPoint';

describe('meetingPoint links', () => {
  it('extrae la primera URL http(s) del texto', () => {
    expect(extractUrl('Bar El Puente, Lentegí https://maps.app.goo.gl/abc123 a las 9:00')).toBe('https://maps.app.goo.gl/abc123');
    expect(extractUrl('Bar El Puente, Lentegí')).toBeNull();
  });

  it('respeta la URL de Google Maps ya pegada en el texto', () => {
    expect(googleMapsUrl('Punto: https://maps.app.goo.gl/h9yEFanVmgBWCrLq5')).toBe('https://maps.app.goo.gl/h9yEFanVmgBWCrLq5');
  });

  it('sin URL, busca el texto en Google Maps', () => {
    expect(googleMapsUrl('Bar El Puente, Lentegí')).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Bar El Puente, Lentegí')}`,
    );
  });

  it('Apple Maps usa el texto descriptivo sin la URL', () => {
    expect(appleMapsUrl('Bar El Puente, Lentegí https://maps.app.goo.gl/abc')).toBe(
      `https://maps.apple.com/?q=${encodeURIComponent('Bar El Puente, Lentegí')}`,
    );
  });

  it('Apple Maps cae al texto completo si solo hay URL', () => {
    expect(appleMapsUrl('https://maps.app.goo.gl/abc')).toBe(
      `https://maps.apple.com/?q=${encodeURIComponent('https://maps.app.goo.gl/abc')}`,
    );
  });

  it('textWithoutUrl limpia espacios sobrantes', () => {
    expect(textWithoutUrl('Aparcamiento  https://maps.app.goo.gl/x  junto al río')).toBe('Aparcamiento junto al río');
  });
});
