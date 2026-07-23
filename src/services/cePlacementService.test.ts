/**
 *  cePlacementService.test.ts
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CEStudentDao } from '../api/ceStudentDao';
import { CEPlacementService } from './cePlacementService';
import { CEPlacementDao } from '../api/cePlacementDao';
import { Cohort, Placement, Plan, Student } from '../api/types';
import { CEEnrollmentService } from './ceEnrollmentService';

// Mock supabase client chain used in updatePlacement
const mockPlacementDao = {
  updatePlacement: vi.fn(() => { }),
  getStudents: vi.fn(() => { })
} as unknown as CEPlacementDao;

const mockStudentDao = {
  update: vi.fn(() => { })
} as unknown as CEStudentDao;

const mockEnrollmentService = {
  getStudents: vi.fn(() => { })
} as unknown as CEEnrollmentService;

const service = new CEPlacementService();

describe('cePlacementService', () => {

  it('getUnplacedStudents ', async () => {

    const cohort = {} as Cohort;

    const plan = {} as Plan;

    const enrolledStudents = [{ id: 'student_1' }, { id: 'student_2' }] as Student[];
    const placedStudents = [{ id: 'student_1' }] as Student[];

    const getEnrollmentServiceSpy = vi.spyOn(CEEnrollmentService, "getInstance").mockReturnValue(mockEnrollmentService);
    const getPlacementDaoInstanceSpy = vi.spyOn(CEPlacementDao, "getInstance").mockReturnValue(mockPlacementDao);
    const getStudentsSpy = vi.spyOn(mockEnrollmentService, "getStudents").mockResolvedValue(enrolledStudents);
    const getPlacementStudentsSpy = vi.spyOn(mockPlacementDao, "getStudents").mockResolvedValue(placedStudents);


    const resp = await service.getUnplacedStudents(cohort, plan);
    expect(getEnrollmentServiceSpy).toHaveBeenCalledOnce();
    expect(getPlacementDaoInstanceSpy).toHaveBeenCalledOnce();
    expect(getStudentsSpy).toHaveBeenCalledOnce();
    expect(getStudentsSpy).toHaveBeenCalledWith(cohort);
    expect(getPlacementStudentsSpy).toHaveBeenCalledOnce();
    expect(getPlacementStudentsSpy).toHaveBeenCalledWith(plan);
    expect(resp).toEqual([{ id: 'student_2' }]);
  });


  it('save ', async () => {

    const student = { id: 'student_1' };
    const placement = {
      plan_id: 'plan_id',
      student_id: 'student_id',
      student: student
    } as Placement;

    const updatedPlacement = {
      plan_id: 'plan_id',
      student_id: 'student_id',
    } as Placement;

    const updatePlacementSpy = vi.spyOn(service, "updatePlacement").mockResolvedValue(updatedPlacement);

    const resp = await service.save(placement);
    expect(updatePlacementSpy).toHaveBeenCalledOnce();
    expect(updatePlacementSpy).toHaveBeenCalledWith(
      'plan_id',
      'student_id',
      {
        plan_id: 'plan_id',
        student_id: 'student_id'
      }
    );
    expect(resp.student).toEqual(student);

  });


  it('updatePlacement - propagates anchor to student when updatePlacement is called with anchor', async () => {

    const updatedPlacement = {} as Placement;
    const updatedStudent = {} as Student;

    const getPlacementDaoInstanceSpy = vi.spyOn(CEPlacementDao, "getInstance").mockReturnValue(mockPlacementDao);
    const getStudentDaoInstanceSpy = vi.spyOn(CEStudentDao, "getInstance").mockReturnValue(mockStudentDao);
    const updatePlacementSpy = vi.spyOn(mockPlacementDao, "updatePlacement").mockResolvedValue(updatedPlacement);
    const updateUpdateSpy = vi.spyOn(mockStudentDao, "update").mockResolvedValue(updatedStudent);

    const resp = await service.updatePlacement('plan1', 'student1', { anchor: true });
    expect(getPlacementDaoInstanceSpy).toHaveBeenCalledOnce();
    expect(getStudentDaoInstanceSpy).toHaveBeenCalledOnce();
    expect(updatePlacementSpy).toHaveBeenCalledOnce();
    expect(updateUpdateSpy).toHaveBeenCalledOnce();
    expect(resp).toEqual(updatedPlacement);
  })

  it('getEnrichedPlacements', async () => {

    const placement1 = { student_id: 'student1' };
    const placement2 = { student_id: 'student2' };
    const student1 = { id: 'student1' };
    const student3 = { id: 'student3' };
    const plan = {
      placements: [placement1, placement2]
    } as unknown as Plan;

    const getInstanceSpy = vi.spyOn(CEPlacementDao, "getInstance").mockReturnValue(mockPlacementDao);
    const getStudentsSpy = vi.spyOn(mockPlacementDao, "getStudents").mockResolvedValue([student1, student3] as Student[]);

    const res = await service.getEnrichedPlacements(plan);
    expect(getInstanceSpy).toHaveBeenCalledOnce();
    expect(getStudentsSpy).toHaveBeenCalledOnce();
    expect(getStudentsSpy).toHaveBeenCalledWith(plan);
    expect(res[0].student).toEqual(student1);
  });

  afterEach(() => {
    // Restores original implementations for all spies
    vi.restoreAllMocks();
  });

});
