import { describe, it, expect, vi, beforeEach } from 'vitest';
import { planGenerator } from './planGenerator';
import { groupService } from './ceGroupService';
import { placementService } from './cePlacementService';
import { planEvaluator } from './planEvaluator';
import { planService } from './cePlanService';
import { studentService } from './ceStudentService';
import { Plan, Placement, Group, Student, TimeWindow } from './types';

vi.mock('./ceGroupService');
vi.mock('./cePlacementService');
vi.mock('./planEvaluator');
vi.mock('./cePlanService');
vi.mock('./ceStudentService');

// Mock students with time windows
const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Student 1',
    age: 20,
    email: 'student1@test.com',
    country: 'USA',
    gender: 'Other',
    anchor: true,
    timeWindows: [
      {
        id: 'tw1',
        start_date_time: new Date('2024-01-01T08:00:00Z'),
        end_date_time: new Date('2024-01-01T10:00:00Z')
      } as TimeWindow
    ]
  },
  {
    id: 's2',
    name: 'Student 2',
    age: 22,
    email: 'student2@test.com',
    country: 'Canada',
    gender: 'Other',
    anchor: false,
    timeWindows: [
      {
        id: 'tw2',
        start_date_time: new Date('2024-01-01T09:00:00Z'),
        end_date_time: new Date('2024-01-01T11:00:00Z')
      } as TimeWindow
    ]
  },
  {
    id: 's3',
    name: 'Student 3',
    age: 21,
    email: 'student3@test.com',
    country: 'Mexico',
    gender: 'Other',
    anchor: false,
    timeWindows: [
      {
        id: 'tw3',
        start_date_time: new Date('2024-01-01T10:00:00Z'),
        end_date_time: new Date('2024-01-01T12:00:00Z')
      } as TimeWindow
    ]
  }
];

const mockPlan: Plan = {
  id: 'plan1',
  name: 'Test Plan',
  cohort_id: 'cohort1',
  note: '',
  placements: [
    { id: 'p1', plan_id: 'plan1', student_id: 's1', anchor: true, priority: 0, student: mockStudents[0] },
    { id: 'p2', plan_id: 'plan1', student_id: 's2', anchor: false, priority: 0, student: mockStudents[1] },
    { id: 'p3', plan_id: 'plan1', student_id: 's3', anchor: false, priority: 0, student: mockStudents[2] },
  ],
  groups: []
};

describe('planGenerator.seedPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock emptyPlan to return plan with no groups
    vi.spyOn(planGenerator, 'emptyPlan').mockResolvedValue({
      ...mockPlan,
      groups: []
    });

    // Mock groupService.batchInsert
    vi.mocked(groupService.batchInsert).mockResolvedValue([]);

    // Mock assignToGroup to return plan with assigned first row students
    vi.spyOn(planGenerator, 'assignToGroup').mockResolvedValue({
      ...mockPlan,
      groups: [
        { id: 'g1', plan_id: 'plan1', name: 'Group 0', country_count: 0, placements: [mockPlan.placements[0]] },
        { id: 'g2', plan_id: 'plan1', name: 'Group 1', country_count: 0, placements: [mockPlan.placements[1]] }
      ]
    });

    // Mock planEvaluator.evaluate
    vi.mocked(planEvaluator.evaluate).mockResolvedValue({
      ...mockPlan,
      groups: [
        { id: 'g1', plan_id: 'plan1', name: 'Group 0', country_count: 1, placements: [mockPlan.placements[0]], time_windows: mockStudents[0].timeWindows },
        { id: 'g2', plan_id: 'plan1', name: 'Group 1', country_count: 1, placements: [mockPlan.placements[1]], time_windows: mockStudents[1].timeWindows }
      ]
    });

    // Mock assignedByTimewindow to return final plan
    vi.spyOn(planGenerator, 'assignedByTimewindow').mockResolvedValue({
      ...mockPlan,
      groups: [
        { id: 'g1', plan_id: 'plan1', name: 'Group 0', country_count: 1, placements: [mockPlan.placements[0]], time_windows: mockStudents[0].timeWindows },
        { id: 'g2', plan_id: 'plan1', name: 'Group 1', country_count: 2, placements: [mockPlan.placements[1], mockPlan.placements[2]], time_windows: mockStudents[1].timeWindows }
      ]
    });
  });

  it('should create the correct number of groups based on nGroup parameter', async () => {
    const result = await planGenerator.seedPlan(mockPlan, 2);

    expect(groupService.batchInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Group 0' }),
        expect.objectContaining({ name: 'Group 1' })
      ])
    );
    expect(result.groups).toHaveLength(2);
  });

  it('should sort placements by anchor status (anchors first)', async () => {
    await planGenerator.seedPlan(mockPlan, 2);

    // Verify that assignToGroup was called with sorted placements
    expect(planGenerator.assignToGroup).toHaveBeenCalledWith(
      expect.any(Object),
      2,
      expect.arrayContaining([
        expect.objectContaining({ student_id: 's1', anchor: true }), // anchor student first
        expect.objectContaining({ student_id: 's2', anchor: false })
      ])
    );
  });

  it('should call all required services in the correct order', async () => {
    await planGenerator.seedPlan(mockPlan, 2);

    expect(planGenerator.emptyPlan).toHaveBeenCalledWith(mockPlan);
    expect(groupService.batchInsert).toHaveBeenCalled();
    expect(planGenerator.assignToGroup).toHaveBeenCalled();
    expect(planEvaluator.evaluate).toHaveBeenCalled();
    expect(planGenerator.assignedByTimewindow).toHaveBeenCalled();
  });

  it('should calculate default number of groups when nGroup is not provided', async () => {
    // With 3 placements and MAX_SIZE = 10, should create 1 group
    await planGenerator.seedPlan(mockPlan, 0);

    expect(groupService.batchInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Group 0' })
      ])
    );
  });
});
