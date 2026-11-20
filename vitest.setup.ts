
import { vi } from 'vitest';

vi.mock('@digitalaidseattle/supabase', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn(),
      // etc.
    }
  })),
}));

// DAOs pull their client from the app Configuration; tests stub the calls they need.
import { SupabaseClient } from '@supabase/supabase-js';
import { setConfiguration } from './src/api/Configuration';
setConfiguration({ supabaseClient: {} as SupabaseClient });
