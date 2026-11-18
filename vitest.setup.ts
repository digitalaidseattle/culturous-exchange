/**
 *  vitest.setup.ts
 *
 *  Runs before every test file. The DAO singletons call getSupabaseClient()
 *  when first created, which throws unless setConfiguration() has run (App.tsx
 *  does this in the browser). Register a stub client here so DAOs can be
 *  constructed in tests; individual tests spy on DAO methods for behaviour.
 */
import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

import { setConfiguration } from './src/api/Configuration';

// A stub client that satisfies the DAO constructors. Tests that exercise a
// query chain should vi.spyOn the DAO method instead of relying on this.
const stubSupabaseClient = {
  from: vi.fn(),
  auth: {
    signInWithOAuth: vi.fn(),
  },
} as unknown as SupabaseClient;

vi.mock('@digitalaidseattle/supabase', () => ({
  createClient: vi.fn(() => stubSupabaseClient),
  supabaseClient: stubSupabaseClient,
}));

setConfiguration({ supabaseClient: stubSupabaseClient });

// MUI X Charts measure their container and draw with the browser's layout, which the test browser does
// not have. Stand in for them with a box that carries the props the chart was given, so a test can check
// what a chart is drawing: `JSON.parse(screen.getByTestId("bar-chart").dataset.props!)`. A test that wants
// to watch the calls itself mocks the same module again.
vi.mock('@mui/x-charts/BarChart', async () => {
  const { createElement } = await import('react');
  return { BarChart: (props: object) => createElement('div', { 'data-testid': 'bar-chart', 'data-props': JSON.stringify(props) }) };
});
vi.mock('@mui/x-charts/PieChart', async () => {
  const { createElement } = await import('react');
  return { PieChart: (props: object) => createElement('div', { 'data-testid': 'pie-chart', 'data-props': JSON.stringify(props) }) };
});
