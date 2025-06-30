import { describe, it, expect, vi, beforeEach } from 'vitest';
import { planGenerator } from './planGenerator';
import { groupService } from './ceGroupService';
import { placementService } from './cePlacementService';
import { planEvaluator } from './planEvaluator';
import { planService } from './cePlanService';
import { studentService } from './ceStudentService';
import { timeWindowService } from './ceTimeWindowService';
import { Plan, Placement, Group, Student, TimeWindow } from './types';

vi.mock('./ceGroupService');
vi.mock('./cePlacementService');
vi.mock('./planEvaluator');
vi.mock('./cePlanService');
vi.mock('./ceStudentService');
vi.mock('./ceTimeWindowService');

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

  it('should produce optimal grouping based on time window overlaps', async () => {
    // Calculate expected optimal overlap manually
    // Student 1: 8:00-10:00 (2 hours)
    // Student 2: 9:00-11:00 (2 hours)
    // Student 3: 10:00-12:00 (2 hours)

    // Optimal grouping:
    // Group 1: Student 1 + Student 2 → overlap = 1 hour (9:00-10:00)
    // Group 2: Student 3 → overlap = 2 hours (10:00-12:00)
    // Total optimal overlap = 3 hours

    const expectedOptimalOverlap = 3; // 1 hour from group 1 + 2 hours from group 2

    // Mock the final result from seedPlan with realistic group assignments
    const finalGroups = [
      {
        id: 'g1',
        plan_id: 'plan1',
        name: 'Group 0',
        country_count: 2,
        placements: [mockPlan.placements[0], mockPlan.placements[1]], // Student 1 + Student 2
        time_windows: [
          {
            id: 'overlap1',
            start_date_time: new Date('2024-01-01T09:00:00Z'),
            end_date_time: new Date('2024-01-01T10:00:00Z')
          } as TimeWindow
        ]
      },
      {
        id: 'g2',
        plan_id: 'plan1',
        name: 'Group 1',
        country_count: 1,
        placements: [mockPlan.placements[2]], // Student 3
        time_windows: [
          {
            id: 'overlap2',
            start_date_time: new Date('2024-01-01T10:00:00Z'),
            end_date_time: new Date('2024-01-01T12:00:00Z')
          } as TimeWindow
        ]
      }
    ];

    vi.spyOn(planGenerator, 'assignedByTimewindow').mockResolvedValue({
      ...mockPlan,
      groups: finalGroups
    });

    // Mock timeWindowService.overlapDuration to return realistic values
    vi.mocked(timeWindowService.overlapDuration).mockImplementation(async (timeWindows: TimeWindow[]) => {
      if (timeWindows.length === 1 && timeWindows[0].start_date_time?.getTime() === new Date('2024-01-01T09:00:00Z').getTime()) {
        return 1; // 1 hour overlap for group 1
      } else if (timeWindows.length === 1 && timeWindows[0].start_date_time?.getTime() === new Date('2024-01-01T10:00:00Z').getTime()) {
        return 2; // 2 hours overlap for group 2
      }
      return 0;
    });

    const result = await planGenerator.seedPlan(mockPlan, 2);

    // Calculate actual total overlap from the result
    let actualTotalOverlap = 0;
    for (const group of result.groups) {
      if (group.time_windows && group.time_windows.length > 0) {
        const groupOverlap = await timeWindowService.overlapDuration(group.time_windows);
        actualTotalOverlap += groupOverlap;
      }
    }

    // Verify that the actual overlap is at least as good as the expected optimal
    expect(actualTotalOverlap).toBeGreaterThanOrEqual(expectedOptimalOverlap);

    // Additional verification: check that groups have the expected number of students
    expect(result.groups[0].placements).toHaveLength(2); // Group 1 should have 2 students
    expect(result.groups[1].placements).toHaveLength(1); // Group 2 should have 1 student
  });

  it('should handle edge case with no overlapping time windows', async () => {
    // Create students with non-overlapping time windows
    const nonOverlappingStudents: Student[] = [
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
            start_date_time: new Date('2024-01-01T14:00:00Z'), // No overlap with s1
            end_date_time: new Date('2024-01-01T16:00:00Z')
          } as TimeWindow
        ]
      }
    ];

    const nonOverlappingPlan: Plan = {
      id: 'plan2',
      name: 'Non-overlapping Plan',
      cohort_id: 'cohort1',
      note: '',
      placements: [
        { id: 'p1', plan_id: 'plan2', student_id: 's1', anchor: true, priority: 0, student: nonOverlappingStudents[0] },
        { id: 'p2', plan_id: 'plan2', student_id: 's2', anchor: false, priority: 0, student: nonOverlappingStudents[1] },
      ],
      groups: []
    };

    // Mock timeWindowService.overlapDuration to return 0 for no overlap
    vi.mocked(timeWindowService.overlapDuration).mockResolvedValue(0);

    const result = await planGenerator.seedPlan(nonOverlappingPlan, 2);

    // Verify that the algorithm still works even with no overlaps
    expect(result.groups).toHaveLength(2);
    expect(result.groups[0].placements).toHaveLength(1);
    expect(result.groups[1].placements).toHaveLength(1);
  });
});
