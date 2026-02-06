
import { vi } from 'vitest';

// Ensure tests run as if in the application's timezone (PST) so date-based tests are deterministic
process.env.TZ = 'America/Los_Angeles';

vi.mock('@digitalaidseattle/supabase', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn(),
      // etc.
    }
  })),
}));