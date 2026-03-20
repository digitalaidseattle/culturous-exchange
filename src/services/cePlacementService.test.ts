/**
 *  cePlacementService.test.ts
 */
import { describe, expect, it, vi } from 'vitest';

import { CEStudentDao } from '../api/ceStudentDao';
import { CEPlacementService } from './cePlacementService';

// Mock supabase client chain used in updatePlacement
vi.mock('@digitalaidseattle/supabase', () => {
  const single = vi.fn(() => Promise.resolve({ data: { plan_id: 'plan1', student_id: 'student1', anchor: true }, error: null }));
  const select = vi.fn(() => ({ single }));
  const eq2 = vi.fn(() => ({ select }));
  const eq1 = vi.fn(() => ({ eq: eq2 }));
  const update = vi.fn(() => ({ eq: eq1 }));
  const from = vi.fn(() => ({ update }));
  return { supabaseClient: { from } };
});

vi.mock('./ceStudentService', () => {
  return {
    studentService: {
      update: vi.fn(() => Promise.resolve({ id: 'student1', anchor: true })),
      mapJson: vi.fn()
    }
  };
});

class PlacementFixture {

  async runUpdate() {
    return CEPlacementService.getInstance().updatePlacement('plan1', 'student1', { anchor: true });
  }

  assertStudentUpdated() {
    const studentDao = CEStudentDao.getInstance();

    expect((studentDao.update as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(1);
    expect((studentDao.update as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('student1');
    expect((studentDao.update as ReturnType<typeof vi.fn>).mock.calls[0][1]).toEqual({ anchor: true });
  }
}

describe('cePlacementService', () => {
  const fixture = new PlacementFixture();

  it('propagates anchor to student when updatePlacement is called with anchor', async () => {
    const res = await fixture.runUpdate();
    // placement update should return the mocked data
    expect(res.plan_id).toBe('plan1');

    // studentService.update should have been called to propagate anchor
    fixture.assertStudentUpdated();
  });
});
