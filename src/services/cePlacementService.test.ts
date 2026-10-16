/**
 *  cePlacementService.test.ts
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CEPlacementDao } from '../api/cePlacementDao';
import { CEStudentDao } from '../api/ceStudentDao';
import { Placement, Student } from '../api/types';
import { CEPlacementService } from './cePlacementService';

describe('cePlacementService', () => {
  const placementDao = CEPlacementDao.getInstance();
  const studentDao = CEStudentDao.getInstance();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('propagates anchor to student when updatePlacement is called with anchor', async () => {
    const updatedPlacement = { plan_id: 'plan1', student_id: 'student1', anchor: true } as Placement;
    const updateSpy = vi.spyOn(placementDao, 'updatePlacement').mockResolvedValue(updatedPlacement);
    const studentSpy = vi.spyOn(studentDao, 'update').mockResolvedValue({ id: 'student1', anchor: true } as Student);

    const res = await CEPlacementService.getInstance().updatePlacement('plan1', 'student1', { anchor: true });

    // placement update should return the DAO result
    expect(res.plan_id).toBe('plan1');
    expect(updateSpy).toHaveBeenCalledWith('plan1', 'student1', { anchor: true });

    // the placement's anchor flag should be propagated to the student record
    expect(studentSpy).toHaveBeenCalledTimes(1);
    expect(studentSpy).toHaveBeenCalledWith('student1', { anchor: true });
  });
});
