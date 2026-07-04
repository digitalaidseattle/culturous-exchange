import { vi } from 'vitest';
import { setConfiguration } from './src/api/Configuration';

setConfiguration({
  supabaseClient: {} as any
});

vi.mock('@digitalaidseattle/supabase', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn(),
    }
  })),
  supabaseClient: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));