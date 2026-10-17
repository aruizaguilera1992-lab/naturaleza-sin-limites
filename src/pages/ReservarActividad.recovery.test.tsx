import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReservarActividad from './ReservarActividad';
const api = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke: api.invoke } } }));
vi.mock('@/lib/depositIntent', () => ({ depositIntentId: vi.fn(), savedDepositIntent: () => '11111111-1111-4111-8111-111111111111' }));
vi.mock('@/hooks/useActivityEvents', () => ({ useActivityEvents: () => ({ events: [], loading: false, error: null, reload: vi.fn() }) }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
it('recovers the existing reference even when the outing is no longer available, without presenting a new booking form', async () => {
  const token = 'a'.repeat(48);
  api.invoke.mockResolvedValue({ data: { token }, error: null });
  render(<HelmetProvider><MemoryRouter initialEntries={['/reservar/barranquismo/guadalmina?evento=fixture']}><Routes>
    <Route path="/reservar/:category/:slug" element={<ReservarActividad />} />
    <Route path="/pago/:token" element={<p>Existing payment route</p>} />
  </Routes></MemoryRouter></HelmetProvider>);
  const button = await screen.findByRole('button', { name: 'Retomar mi reserva' });
  expect(screen.queryByLabelText('Nombre y apellidos')).not.toBeInTheDocument();
  expect(api.invoke).toHaveBeenCalledWith('create-activity-deposit', { body: { action: 'recover', requestId: '11111111-1111-4111-8111-111111111111' } });
  fireEvent.click(button);
  expect(await screen.findByText('Existing payment route')).toBeInTheDocument();
  expect(api.invoke).toHaveBeenCalledTimes(1);
});
