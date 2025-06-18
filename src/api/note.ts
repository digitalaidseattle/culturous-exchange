// async seedPlan(plan: Plan, nGroup: number): Promise<Plan> {
//     const cleaned = await this.emptyPlan(plan)

//     console.log('Number nG:', nGroup);

//     const nGroups = nGroup || Math.ceil(cleaned.placements.length / MAX_SIZE);

//     console.log('Number of groups:', nGroups);

//     // create groups arrays that has group objects.
//     let groups = Array.from({ length: nGroups }, (_, groupNo) => {
//       return {
//         id: uuid(),
//         plan_id: plan.id,
//         name: `Group ${groupNo}`,
//         country_count: 0
//       } as Group;
//     });

//     console.log('Created groups:', groups);
//     console.log('Plan:', plan);

//     // Insert into groups table
//     let updatedPlan = await groupService.batchInsert(groups)
//       .then(() => {
//         return {
//           ...plan,
//           groups: groups
//         } as Plan;
//       });

//     // First, handle anchor students and assign first row students
//     // TODO or use updated plan?
//     const anchorPlacements = plan.placements.filter(p => p.anchor);
//     const nonAnchorPlacements = plan.placements.filter(p => !p.anchor);
//     const firstRowStudents: Placement[] = [];

//     const numAnchorsToUse = Math.min(anchorPlacements.length, nGroups);
//     firstRowStudents.push(...anchorPlacements.splice(0, numAnchorsToUse));
//     const remainingSlots = nGroups - numAnchorsToUse;
//     firstRowStudents.push(...nonAnchorPlacements.splice(0, remainingSlots));

//     let remainingPlacements = [
//       ...anchorPlacements, // left-over anchors if more than nGroup
//       ...nonAnchorPlacements // non-anchor students
//     ];

//     console.log('--- First row students:', [...firstRowStudents]);

//     // 1. Place anchor student first for the first row.
//     // TODO : Chang this to use AWAIT
//     const firstRowStudentsPromises = firstRowStudents.map((placement, index) => {
//       const group = updatedPlan.groups[index % nGroups];
//       return placementService.updatePlacement(placement.plan_id, placement.student_id, { group_id: group.id });
//     });
//     await Promise.all(firstRowStudentsPromises);

//     updatedPlan = await planEvaluator.evaluate(updatedPlan);

//     console.log('Update Plan:', updatedPlan);
//     console.log('Remaining placements:', remainingPlacements);

//     // Sort students by their max available time windows (the most flexible students)
//     const placementsWithHours = await Promise.all(
//       remainingPlacements.map(async (placement) => ({
//         placement,
//         hours: await this.getTotalAvailableHours(placement.student?.timeWindows ?? [])
//       }))
//     );
//     placementsWithHours.sort((a, b) => b.hours - a.hours);
//     // extract the placement property 
//     // from each object in the placementsWithHours array and assign the resulting array to remainingPlacements

//     console.log('remainingPlacements after sorting by hours:', remainingPlacements.map(s => ({
//       id: s.student_id,
//       hours: placementsWithHours.find(p => p.placement.student_id === s.student_id)?.hours
//     })));
//     remainingPlacements = placementsWithHours.map(p => p.placement); 

//     console.log('remainingPlacements before greedy grouping:', remainingPlacements.map(p => p.student_id));


//     // TODO: Fix there is a bug. dont get all students in groups
//     // 2. Assign Remaining Students Using Greedy Grouping
//     // ? : Do load balancing here either by Row-by-row group iteration or Student-priority greedy
//     const maxGroupSize = Math.ceil(updatedPlan.placements.length / updatedPlan.groups.length);
//     updatedPlan.groups = await groupService.greedyGrouping(updatedPlan.groups, maxGroupSize, remainingPlacements);

//     console.log('Groups after greedy grouping:', updatedPlan.groups.map(g => ({
//       id: g.id,
//       placements: g.placements?.map(p => p.student_id)
//     })));

//     // 4. If the group is full, place the student in the next group.
//     //getBestGroup(groups, placement) for non anchor

//     // Update the plan to have the updated groups, attach placements to the group objects
//     //fetch students+timewindows and attach each enriched students to its placements
//     return this.hydratePlan(plan.id);
//   }


// // debugging output in assignedByTimewindow
// console.log("=== UPDATED PLACEMENTS ===");
//     updatedPlan.placements.forEach((placement, index) => {
//         console.log(`Placement ${index}: student_id=${placement.student_id}, group_id=${placement.group_id}`);
//     });

//     console.log("=== GROUP ASSIGNMENTS ===");
//     updatedPlan.groups.forEach((group, index) => {
//         const placementCount = group.placements?.length || 0;
//         console.log(`Group ${index} (${group.name}): ${placementCount} students`);
//         group.placements?.forEach(p => console.log(`  - Student: ${p.student_id}`));
//     });