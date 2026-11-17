import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReservarActividad from './ReservarActividad';

const api = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke: api.invoke } } }));
vi.mock('@/lib/depositIntent', () => ({
  depositIntentId: vi.fn(),
  forgetDepositIntent: vi.fn(),
  savedDepositIntent: () => null,
}));

/** Salida de grupo abierto con 6 plazas libres y 55 € por persona. */
const { event } = vi.hoisted(() => ({
  event: {
    id: 'evt-1',
    category: 'espeleologia',
    slug: 'iniciacion',
    title: 'Espeleología de iniciación: Travesía Cueva de la Higuera',
    starts_at: '2026-11-21T07:00:00.000Z',
    ends_at: null,
    meeting_point_public: 'Archidona, Málaga',
    latitude: null,
    longitude: null,
    capacity_total: 6,
    seats_reserved: 0,
    price_cents: 5500,
    status: 'publicada',
    rules: null,
    steps: null,
    startDate: new Date('2026-11-21T07:00:00.000Z'),
    freeSeats: 6,
    isFull: false,
    pricePerPerson: 55,
    zone: 'Archidona, Málaga',
  },
}));

vi.mock('@/hooks/useActivityEvents', () => ({
  useActivityEvents: () => ({ events: [event], loading: false, error: null, reload: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const renderBooking = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/reservar/espeleologia/iniciacion?evento=evt-1']}>
        <Routes>
          <Route path="/reservar/:category/:slug" element={<ReservarActividad />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );

it('permite reservar una sola plaza en un grupo abierto', async () => {
  renderBooking();
  const group = await screen.findByRole('radiogroup', { name: 'Participantes' });

  // La opción de 1 persona existe y se puede elegir.
  const one = within(group).getByRole('radio', { name: '1' });
  expect(one).toBeEnabled();
  fireEvent.click(one);
  expect(within(group).getByRole('radio', { name: '1' })).toHaveAttribute('aria-checked', 'true');

  // La señal del 30 % se recalcula para una persona: 55 € × 30 % = 16,50 €.
  expect(await screen.findByText('16,50 €')).toBeInTheDocument();
  expect(screen.getByText('55,00 €')).toBeInTheDocument();
});
