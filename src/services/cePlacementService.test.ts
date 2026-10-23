/**
 *  cePlacementService.test.ts
 */
import { describe, expect, it, vi } from 'vitest';

import { CEPlacementDao } from '../api/cePlacementDao';
import { CEStudentDao } from '../api/ceStudentDao';
import { CEPlacementService } from './cePlacementService';

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
    vi.spyOn(CEPlacementDao.getInstance(), 'updatePlacement')
      .mockResolvedValue({ plan_id: 'plan1', student_id: 'student1', anchor: true } as any);
    vi.spyOn(CEStudentDao.getInstance(), 'update').mockResolvedValue({} as any);
    const res = await fixture.runUpdate();
    // placement update should return the mocked data
    expect(res.plan_id).toBe('plan1');

    // studentService.update should have been called to propagate anchor
    fixture.assertStudentUpdated();
  });
});
