import { describe, expect, it } from 'vitest';
import {
  appleMapsUrl,
  canOpenInAppleMaps,
  extractUrl,
  googleMapsUrl,
  isMeetingPointLabel,
  isShortMapLink,
  parseMapsUrl,
  textWithoutUrl,
} from './meetingPoint';

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

  it('Apple Maps abre el punto exacto cuando hay coordenadas resueltas', () => {
    expect(appleMapsUrl('Quedada: https://maps.app.goo.gl/abc', { name: 'Parking benahavis', latitude: 36.5078654, longitude: -5.0334034 })).toBe(
      'https://maps.apple.com/?ll=36.5078654,-5.0334034&q=Parking%20benahavis',
    );
  });

  it('textWithoutUrl limpia espacios sobrantes', () => {
    expect(textWithoutUrl('Aparcamiento  https://maps.app.goo.gl/x  junto al río')).toBe('Aparcamiento junto al río');
  });

  it('reconoce los pasos del cronograma que son el punto de quedada', () => {
    expect(isMeetingPointLabel('Quedada en el punto de encuentro: https://maps.app.goo.gl/abc')).toBe(true);
    expect(isMeetingPointLabel('Punto de quedada')).toBe(true);
    expect(isMeetingPointLabel('Aproximación')).toBe(false);
    expect(isMeetingPointLabel('Actividad')).toBe(false);
  });

  it('solo intenta resolver los enlaces cortos de Google', () => {
    expect(isShortMapLink('https://maps.app.goo.gl/abc')).toBe(true);
    expect(isShortMapLink('https://goo.gl/abc')).toBe(true);
    expect(isShortMapLink('https://www.google.com/maps/place/x')).toBe(false);
    expect(isShortMapLink('https://evil.example/?u=https://maps.app.goo.gl/abc')).toBe(false);
    expect(isShortMapLink(null)).toBe(false);
  });

  it('lee el nombre y las coordenadas del enlace resuelto', () => {
    const t = parseMapsUrl(
      'https://www.google.com/maps/place/Parking+benahavis/@36.507864,-5.0364634,16z/data=!4m6!3m5!1s0xd72d5d00350959d:0x9819691464cdfb5f!8m2!3d36.5078654!4d-5.0334034!16s%2Fg%2F11hz1g89y7?entry=tts',
    );
    expect(t).toEqual({ name: 'Parking benahavis', latitude: 36.5078654, longitude: -5.0334034 });
  });

  it('acepta otras formas de enlace de Google Maps', () => {
    expect(parseMapsUrl('https://www.google.com/maps/search/?api=1&query=36.5078654%2C-5.0334034')).toEqual({
      name: null,
      latitude: 36.5078654,
      longitude: -5.0334034,
    });
    expect(parseMapsUrl('https://maps.google.com/maps?q=Bar%20El%20Puente')).toEqual({ name: null, latitude: null, longitude: null });
  });

  it('ofrece Apple Maps solo con coordenadas o con un nombre legible', () => {
    // Enlace de Google sin resolver: Apple no tiene nada que abrir.
    expect(canOpenInAppleMaps('https://maps.app.goo.gl/abc')).toBe(false);
    expect(canOpenInAppleMaps('https://maps.app.goo.gl/abc', null)).toBe(false);
    // Resuelto: abre el punto exacto.
    expect(canOpenInAppleMaps('https://maps.app.goo.gl/abc', { name: 'Parking benahavis', latitude: 36.5078654, longitude: -5.0334034 })).toBe(true);
    // Texto legible junto al enlace: se puede buscar ese texto.
    expect(canOpenInAppleMaps('Quedada en el punto de encuentro: https://maps.app.goo.gl/abc')).toBe(true);
    // Solo texto, sin enlace.
    expect(canOpenInAppleMaps('Bar El Puente, Lentegí')).toBe(true);
  });
});
