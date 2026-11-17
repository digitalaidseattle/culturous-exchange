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
