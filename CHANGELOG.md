# Culturous Exchange: Site Changes

This document tracks how the site differs from where it started and where we are taking it.
It is written for people, not developers. Each entry says what a user will notice, with a short
technical note at the end for whoever reviews the code. Entries describe the net result, not the
steps taken to get there.

- **Starting point:** the `dev` branch on 2026-10-27 (commit `35ce46d`)
- **Working branch:** `aidan/onboarding`
- **Last updated:** 2026-10-28
- **Design reference:** the "Culturous Exchange" Figma file (home page frame, shared as a screenshot)

---

## The site at the starting point

| Area | What it looked like |
|---|---|
| Sidebar | Home, Cohorts, Students, Facilitators |
| Home page | A banner for the most recent cohort, with its student and plan counts and an Open button |
| Cohorts page | A separate page with a New button and one card per cohort, in a row |
| Cohort page | Breadcrumb trail: Home › Cohorts › Cohort |
| Plan page | Breadcrumb trail: Home › Cohorts › Cohort › Plan |
| Cohort page (Plans tab) | A name field you edit in place and a New Plan button, then Plans and Students tabs. Plans were small square cards in a row, each with a star, notes, counts, and a three-dot menu with Open, Duplicate, Delete, and Set Active |
| New plan | One click made a plan named "New Plan", with no choices |
| Students, Facilitators | Table pages with upload and add buttons |

## The end state we are working toward

This section grows as decisions are made. Each numbered change below adds a line here.

- Cohorts are managed from the home page. There is no separate Cohorts tab. *(Change 1)*
- The home page has a "Current Cohort" section and an "All Cohorts" list. Every cohort card has shortcuts to its students, its plans, and a new plan, plus an Open Cohort button. *(Change 2)*
- A floating button on the home page creates cohorts and imports student lists. *(Change 2)*
- The cohort page opens with a summary panel and a prominent cohort title, and its plans are wide cards in the same style as the home page. *(Change 3)*
- Each plan card summarizes its plan: totals, the countries it represents, and distribution charts of group size, countries per group, and time overlap per group. The totals and charts rearrange to fit the room, in four sizes. *(Change 4)*
- A plan card opens the plan when clicked, shows its status as a readable tag beside its name, and has quick actions to edit its groups and students, set off by a divider, as the cohort cards do. *(Change 5)*
- Starting a plan opens a Create New Plan window that shows the cohort, with a default name of "Plan N", a minimum overlap, a group size range, an Optimize button, and a live preview of the groups before anything is created. *(Change 6)*

---

## Summary of changes

| # | Change | Status | Date |
|---|---|---|---|
| 1 | Cohorts move to the home page | Built and checked locally, not yet committed | 2026-10-27 |
| 2 | Home page and cohort cards redesigned to match the Figma mock | Built and checked locally, not yet committed | 2026-10-27 |
| 3 | Cohort page (Plans tab) redesigned with a cohort summary panel | Built and checked locally, not yet committed | 2026-10-27 |
| 4 | Plan cards show totals, countries, and distribution charts that fit the room | Built and checked locally, not yet committed | 2026-10-28 |
| 5 | Plan cards open on click, with a readable status tag, more menu items, and quick actions | Built and checked locally, not yet committed | 2026-10-28 |
| 6 | Create New Plan window: cohort, "Plan N" names, minimums, group size range, Optimize, and a live preview | Built and checked locally, not yet committed | 2026-10-28 |

---

## Changes

### 1. Cohorts move to the home page

**Before:** Cohorts lived on their own tab. The home page showed only a banner for the latest cohort.

**After:** The home page is the cohort list.

What a user will notice:

- The **Cohorts tab is gone** from the sidebar, which now reads Home, Students, Facilitators.
- **Old links still work.** Anyone who opens a saved `/cohorts` link lands on the home page.
- **Breadcrumbs are one step shorter.** The home icon now leads to the cohort list, so the separate "Cohorts" step was removed.
  - Cohort page: Home › Cohort (was Home › Cohorts › Cohort)
  - Plan page: Home › Cohort › Plan (was Home › Cohorts › Cohort › Plan)
- The home page no longer asks for "the latest cohort" in the old way, which caused a blank home page on an empty database.

**Technical notes:**

- Removed the Cohorts item from the sidebar config (`src/Config.tsx`) and deleted the Cohorts page (`src/pages/cohorts/index.tsx`).
- `/cohorts` is now a redirect to `/` in `src/pages/routes.tsx`.
- `CECohortDao.getLatest()` is no longer used by the app. It was left in place.
- `src/pages/cohorts/CohortsTable.tsx` was already unused before this change and was left alone.

---

### 2. Home page and cohort cards redesigned to match the Figma mock

**Before:** Cohort cards were small square cards in a row. Each had a name, two counts, and a three-dot menu with Open and Delete. Double-clicking a card opened it.

**After:** The home page follows the Figma mock.

What a user will notice:

- **A "Current Cohort" section** at the top shows the newest cohort, marked with a "Current Cohort" tag.
- **An "All Cohorts" list** below it shows every cohort, newest first, as wide cards stacked top to bottom. The current cohort carries the same "Current Cohort" tag here too.
- **Each card shows the cohort name, its student and plan counts, and four buttons:**
  - Go to students: opens the cohort on its Students tab
  - Go to plans: opens the cohort on its Plans tab
  - New plan: opens the Create New Plan window (Change 6)
  - Open Cohort: opens the cohort
- **A floating button** in the bottom-right corner opens two actions:
  - New Cohort: creates a cohort, same as before
  - Import Student List: choose a spreadsheet to add students. This works like Upload on the Students page. The students go into the student list and are not placed in any cohort. Rows that fail are shown in the same "needs attention" window.
- **New Cohort also stays beside the "All Cohorts" heading.** Both places do the same thing.
- **Each card's three-dot menu has Edit Name and Delete.**
  - Edit Name opens a window titled "Edit Cohort Name" with the current name filled in, and Cancel and Save buttons.
  - Save is greyed out when the name is blank or unchanged. Extra spaces at the start or end do not count as a change, and they are not saved.
  - Pressing Enter saves, when Save is available. A confirmation message appears and the name updates everywhere it is shown.

**Decisions to confirm:**

- **"Current" means the most recently created cohort.** The old banner used the same rule.
- **The current cohort also appears in "All Cohorts".** The mock does not say whether it should. We read "All" literally. Excluding it is a one-line change.
- **Four things are not in the mock:** the New Cohort buttons, the floating button, and a small three-dot menu on each card with Edit Name and Delete. Without them the home page could not create, rename, or delete cohorts.
- **Not changed:** the top bar. The mock shows the app name and the signed-in user's avatar and name. The top bar comes from the shared Digital Aid Seattle layout, so it was left alone.
- **Close, not exact:** the icons are the outline style the app already uses, where the mock uses solid Material icons. The blue is the app's theme blue, which is close to the mock's.

**How it was checked:** The project type-checks, all 59 unit tests pass, and lint reports no new problems. In the browser we checked the layout against the mock, each of the four card buttons, the New Cohort and Import actions on the floating button, and deleting a cohort and a plan. The import was tried with a one-student spreadsheet. The rename window was checked for blank, spaces-only, unchanged, and changed names, plus Save, Cancel, and the Enter key. All test data was removed or restored afterward.

**Technical notes:**

- The home page (`src/pages/home/index.tsx`) now loads the cohorts, sorts them newest first, and treats the first as current. It passes the current flag to every card that shows that cohort.
- `CohortCard` was rewritten, `HomeActions` is new (the floating button), and `CohortsStack` was removed.
- Edit Name saves through the same cohort update call the cohort page uses to rename a cohort.
- Import Student List uses `StudentUploader`, the same code as the Students page. The result handling is copied from that page, so it now exists in three places. It could be shared later.
- New text lives in `src/constants.ts`.

---

### 3. Cohort page (Plans tab) redesigned with a cohort summary panel

This is the page that opens from "Go to plans" or "Open Cohort" on the home page. There was no mock for it, so it follows the look of the home page.

**Before:** A small card held the cohort name, which you edited in place, and a New Plan button. Below it, Plans and Students tabs sat inside a bordered box. Plans were small square cards in a row.

**After:**

What a user will notice:

- **A summary panel at the top** with the cohort name as a large, bold title. Under it: number of students, number of plans, the active plan (or "None"), and the date the cohort was created. At the bottom left of the panel, under a divider, are the **New plan** and **Manage students** buttons. New plan opens the Create New Plan window (Change 6). Manage students switches to the Students tab, where students are uploaded, added, and removed.
- **A pencil icon beside the title** opens the same "Edit Cohort Name" window used on the home page. The name on the page and in the breadcrumb updates when you save.
- **Plans are wide cards stacked top to bottom,** with the same raised look as the cohort cards. What a plan card shows is described in Changes 4 and 5. Its note, if it has one, sits under the plan name.
- **The summary panel and the plan cards are up to 960 pixels wide,** and the same width as each other. That is wide enough for a plan's totals to sit beside its charts (Change 4).
- **A cohort with no plans** shows "No plans yet. Use New plan to create one."
- **The Students tab** now sits in the same raised card. Its table and buttons are unchanged.
- The tabs and plan list line up with the summary panel instead of being indented.

**Decisions to confirm:**

- **"The plans page" was read as the cohort page's Plans tab,** since a cohort summary belongs there. The page for a single plan (the group board) was not changed.
- **The summary does not show the "Current Cohort" tag.** Showing it would need an extra lookup of all cohorts. It can be added.
- **The summary content is our choice:** students, plans, active plan, and created date. Easy to change.
- **The 960 pixel width.** The mock's cards looked narrower, about 720 pixels. At 720 a card has only about 690 inside, which is too narrow for the totals to sit beside the charts, so that layout would only appear in the New Plan window. If you prefer 720, it is one number, `CONTENT_MAX_WIDTH`. Another option is to keep the header panel narrow and let only the plan cards grow.

**How it was checked:** The project type-checks, all 59 unit tests pass, and lint reports no new problems. In the browser we checked the summary panel, renaming from the pencil icon (including the Enter key and reopening the window), the plan cards, setting a plan active and inactive, the empty state, the Students tab, and Open Plan. Test changes were reverted afterward.

**Technical notes:**

- The card and button styles are now shared in `src/utils/styles.ts` and used by the home and cohort pages.
- The rename window moved into its own component, `src/components/EditCohortNameDialog.tsx`, used by both the home cards and the cohort page. The old in-place name field on the cohort page was removed.
- `PlanCard` and `PlansStack` were rewritten. `PlansStack` also stopped sorting the cohort's plan list in place.
- `TabPanel` gained an optional `disableGutters` setting so tab content can line up with the page edge.
- The header buttons and the width limit (`CONTENT_MAX_WIDTH`) are in `src/pages/cohort/index.tsx`. The old handler that created a plan at once was removed from the cohort page and the home card.

---

### 4. Plan cards show totals, countries, and distribution charts that fit the room

**Before:** A plan card listed a few numbers in one wrapped row: groups, students, total plan duration, average countries per group, and average duration per group.

**After:** Each plan card is a small summary of the plan.

What a user will notice, from top to bottom:

- **A totals panel** with three large numbers: Groups, Students, and Waitlisted students. Waitlisted students are those in the plan who are not in any group.
- **Three matching dot plots,** each in its own outlined box with a title. **Every group is one dot** above a horizontal axis, placed at its value. Groups with the same value **stack** one on top of the other, so two groups of the same size make a two-dot stack above that size. Values that no group has are left empty. For example, five groups of sizes 3, 4, 7, 9, and 10 are five separate dots; two groups of 7 would be a two-dot stack above 7. Dots shrink if a stack is tall or neighbors are close, so they always fit.
  - **The chart sits on its own small white panel with rounded corners and a light border,** inside the tinted box. The dots, the axis, and the axis numbers are on the white panel; the title and the Min and Max readouts stay on the tinted box. The panel has a little padding, so a dot on the very edge of the axis, such as a group with 0, is not cut off.
  - **The chart is only as tall as it needs to be.** Its height is set by the number of groups in the plan: just tall enough for a stack with one full-size dot for every group, which is the worst case of every group having the same value. A plan with 5 groups gets room for 5 dots and a plan with 3 groups gets room for 3, so there is no spare white space above the dots. All three charts on a plan are the same height.
  - **The axis** starts at 0, or at the minimum minus two if that is larger, and ends at the maximum plus two. For example, group sizes from 3 to 10 give an axis from 1 to 12, and countries per group from 2 to 8 give an axis from 0 to 10. Both ends are numbered, with a few numbers in between.
  - **Minimum and maximum:** these have no dots of their own. They are the leftmost and rightmost dots, and their values are written in the readout.
  - **A readout under each chart** gives the value and its unit for Min on the left and Max on the right.
  - **The average is hidden.** There is no average line and no Avg readout for now. The average is still worked out, and showing it again is one setting on the chart. When it comes back it is a dashed vertical line at the true average, which can fall between dots, with an Avg readout between Min and Max.

  The three charts are:
  - **Group size:** students per group
  - **Countries per group:** this replaces the old "Avg. Countries/Group" line
  - **Time overlap per group:** hours of shared time per group. **This chart is color coded by hours:** each dot takes the color of its value, blending smoothly from red at 0 hours, to orange at 1 hour, to yellow from 2 to 3 hours, to green from 4 hours. So under 2 hours reads red to orange, 2 to 3 hours is yellow, and over 3 hours turns green. The other two charts stay blue.
- A plan with no groups yet shows "No groups yet" in the box. If every group has the same value, the chart shows one stack with a dot for each group, and one readout, "Min = Max".
- **Countries represented,** under the charts, as a wrapped list of small outlined tags, one per country, in alphabetical order. Each tag starts with the country's flag emoji, has a little extra space before the flag, and ends with the number of students from that country in bold, for example 🇧🇷 Brazil **8**. A country is listed once even if students typed it with different capital letters, and its number counts all of them.

**The totals and charts fit the room.** The same block is used in the New Plan window (Change 6). It has four sizes, set by the width of the card or window rather than of the screen:

- **Large (840 pixels or more):** the totals are a column to the left of the three charts, all in one row, with each label to the right of its number: "5 Groups", "48 Students", "15 Waitlisted students", one under another with a line between them.
- **Medium (632 to 840):** all three charts still fit side by side, but not with the totals, so the totals are in a row across the top, each label under its number.
- **Small (416 to 632), where three charts can't fit side by side:** the totals join the charts in a 2 by 2 grid. The totals panel is the first cell, top left, followed by Group size, then Countries per group and Time overlap per group below. It is the same column as in the large size: each label to the right of its number.
- **Extra small (under 416), where two charts can't fit side by side:** everything is stacked in one column: the totals in a row first, then each chart, full width.

Wherever the totals are a column (large and small), each number and its label are centered together in the panel, the number on the left and the label to its right, with the label vertically centered on the number. "Waitlisted students" wraps onto two lines, "Waitlisted" over "students". Numbers line up on their right edge so the labels line up within a panel. In the medium and extra small sizes, where the totals are a row, each label stays under its number on one line.

The sizes come from the narrowest a chart can be (200 pixels) added up: two charts and a gap are 416, three charts and two gaps are 632, and the column of totals beside them brings it to 840. A plan card on a wide screen and the New Plan window at full size are both large.

**Decisions to confirm:**

- **"Immediately under New plan" was read as directly under the plan's name on each card.** If you meant under the New plan button at the top of the page, say so.
- **Green is fully reached at 4 hours.** The blend from yellow at 3 hours to green takes one hour, the same spacing as red, orange, and yellow, so a group with exactly 3 hours shared is still yellow and one with 3.5 is half way to green. If you want a 3 hour group to be fully green, that is one number to change.
- **The colors come from the app's color palette** (red, orange, yellow, and green), not from the theme's warning and success colors, because the theme has no orange and its warning color is close to amber.
- **Only the Time overlap per group dots are colored,** each by its own value. The other two charts' dots are blue. There is no color key on the chart; the axis numbers show where each color sits.
- **"Starts at 0 or Min minus two" was read as whichever is larger,** so an axis never goes below 0. The "two" is two units of that chart: students, countries, or hours.
- **Chart height stops growing at 12 groups.** Beyond that the dots get smaller instead of the chart getting taller, so a very large plan does not push the rest of the card far down.
- **Each dot is a group, and nothing is estimated.** A fitted curve would put height where no group has a value and make five groups look like many more. The dot plot shows exactly the groups there are. The tallest stack is the value most groups share, so there is no vertical scale.
- **Each chart has its own horizontal scale,** so charts are not comparable with each other.
- **Units are on every chart label** (students, countries, hours). Singular is used for 1.
- **Flags come from the name people typed.** Matching ignores capital letters, accents, and spaces, so "PAKISTAN", "Perú", and "Afghanistan " all work. Common alternate names work too (USA, UK, Turkey, Czech Republic, Ivory Coast, and others). If the text holds more than a country, the country named first is used, so "Russia, but living in Germany" gets the Russian flag. The tag still shows the text as typed.
- **The number counts every student in the plan from that country,** including waitlisted students. The numbers add up to the plan's Students total, except for any student with no country entered.
- **A screen reader reads the number with the word "students"** (for example "Brazil 8 students"), though only the bold number shows.
- **A globe 🌐 is shown for a name that is not recognized,** instead of guessing.
- **England, Scotland, Wales, and Northern Ireland show the United Kingdom flag,** as does "UK". Separate flags for them exist but do not display on many systems.
- **Windows may show two letters instead of a flag.** A flag emoji is two special letters, and Windows draws them as letters. Mac, iPhone, Android, and Linux browsers draw the flag.
- **The same country typed two ways still gets two tags.** For example "Peru" and "Perú" both appear, each with the 🇵🇪 flag. Capital letters and extra spaces are already merged, but spelling variants are not. This could be merged in a follow-up.
- **The old "Total Overlap" and "Average Group Overlap" text lines are gone.** The "Total Overlap" figure was the same number for every plan (48 hours), because the code behind it adds up only the default weekend time windows and has a "TODO" noting the real overlap is not removed yet. The Time overlap per group chart covers the same ground. The values are still saved with each plan, so they can be shown again once that calculation is fixed.
- **Overlap on the screens is the real shared time, for now.** The saved overlap for a group counts one extra hour for every shared window, so a 4 hour shared window is saved as 5. Until that counting rule is confirmed with the maintainer, the Time overlap per group chart and the "Duration (hr)" line on the plan page's group cards show the real length of the group's shared windows instead: 4 hours for that window, and 0.5 for a 30 minute one. The rule itself and the saved values were not changed, and the plan generator still ranks groups with the saved rule. If the rule is confirmed as is, switching the screens back is a small change.
- **The overlap is read from each group's saved shared windows.** If students are moved and the plan is not re-evaluated, the overlap chart can lag behind. Group size, countries, and the totals are counted live.
- **The layout switches at 840, 632, and 416 pixels.** Each size was asked for, so the totals move from beside the charts, to above them, to a 2 by 2 grid, to a stack as the space shrinks. If that is too many shapes, the 2 by 2 grid is the easiest to drop.

**How it was checked:** The project type-checks, all unit tests pass (new ones cover the statistics, the axis range and numbering, the stacking, the sizing of dots, the color scale, the chart's labels, units, and its empty and all-the-same cases, and the layout rules for each size), and lint reports no new problems. In the browser we compared the plans on the local data against the database: group sizes, countries per group, overlap hours, and waitlisted counts all matched, and the dots, stacks, axes, and colors were checked by eye. Each of the four sizes was checked on the plan card and in the New Plan window, and the centering of the numbers and labels was measured.

**Technical notes:**

- New `src/services/plan/planStats.ts` computes the totals, country list, and min/average/max values from a plan, and keeps the per-group values so the dots can be stacked. It has no database access and is covered by `planStats.test.ts`. It returns each country with its student count.
- New `src/utils/distribution.ts` works out the axis range and numbers, the stacks (how many groups have each value), and where the average falls, which is only used when the average is shown. It is tested in `distribution.test.ts`.
- The chart box style is shared in `src/utils/styles.ts` and also used by the totals panel.
- Color coding looks up each dot's color from a scale (`src/utils/gradient.ts`), so a value always has the same color wherever the axis starts. The scale for overlap lives in `src/utils/overlapColors.ts`, and any chart can be given a scale.
- New `src/utils/countryFlag.ts` turns a country name into a flag emoji. It uses the browser's own list of English country names plus a short list of alternate names, and only the official country codes (the browser also knows retired ones such as "UK" and "SU", which would have given Russia the Soviet flag). No flag images or libraries were added. New `src/components/CountryChip.tsx` is the tag; the flag is hidden from screen readers, which read the country name and the number.
- A new `totalHours` in the time window service adds up the real length of a group's windows. The existing `duration` and `totalDuration` and their tests are untouched. `planStats.ts` and `GroupCard.tsx` use `totalHours` instead of the saved group duration.
- The strings for the removed text lines ("Avg. Countries/Group", "Total Overlap", "Average Group Overlap") were deleted from `src/constants.ts`.
- `PlanSummary.tsx` (used by `PlanCard` and the New Plan window) puts `PlanTotals` and the three charts from `PlanCharts` in one CSS grid inside a container (`container-type: inline-size`) and switches layout with container queries at three widths defined in `PlanTotals.tsx`: `TWO_CHARTS_WIDTH` (416 pixels: 2 by 2 grid, totals stacked; below it everything is one column), `THREE_CHARTS_WIDTH` (632 pixels: three charts in a row, totals across the top), and `TOTALS_BESIDE_WIDTH` (840 pixels: totals in a column to the left). The totals' column layout and the lines between them apply in the 2 by 2 band and from 840 up, and so does the label beside the number. `PlanCharts` returns just the three charts as grid items. Browsers without container query support keep the row layout.

---

### 5. Plan cards open on click, with a readable status tag, more menu items, and quick actions

**Before:** A plan card opened only by double-clicking it or pressing Open Plan. A star beside the name showed whether the plan was active and toggled it when clicked. The three-dot menu had Duplicate, Delete, and Set Active or Set Inactive. The only button at the bottom was Open Plan. On the home page, the quick action buttons on the cohort cards sat directly under the counts.

**After:**

What a user will notice:

- **Clicking anywhere on a plan card opens the plan.** The card shows a pointer and lifts slightly under the mouse. The buttons, the menu, and the windows opened from them do not also open the plan.
- **A status tag beside the plan name, replacing the star,** shown for every plan. It reads "Active" or "Inactive", always in the same dark text as the rest of the page so it is easy to read. An Active plan has a pale sage mint green fill with a soft green outline; an Inactive plan has a plain grey outline. The text is about 12 to 1 against the mint, above the strictest common accessibility threshold (7 to 1). Setting a plan active or inactive is now done from the three-dot menu.
- **The three-dot menu** now has Open Plan, Edit Name, Duplicate, Delete, and Set Active or Set Inactive, in that order.
- **Edit Name** opens a window titled "Edit Plan Name" with Save and Cancel. It follows the same rules as the cohort rename window: Save is off when the name is blank or unchanged, extra spaces around the name are ignored, and Enter saves.
- **A quick actions row at the bottom of each plan card,** like the one on the cohort cards: **Edit Groups** and **Edit Students** on the left, and **Open Plan** on the right.
  - Edit Groups opens the plan with the group details showing on the board (countries, duration, facilitators, time windows).
  - Edit Students opens the plan with the student details showing on the board (country, time windows).
- **A divider above the quick actions row on both the plan cards and the cohort cards.**

**Decisions to confirm:**

- **Edit Groups and Edit Students open the plan with that part's details switched on.** The plan page has no separate groups or students screens. Groups and students are both edited on the one board, which already has two toggles for showing group details and student details. The buttons use those toggles, so they differ only in which details start out showing. If you meant something else, such as a window for renaming groups or adding students, say so.
- **The star no longer toggles active status.** It was a quick toggle and is replaced by a status tag that only displays. The menu still toggles it.
- **The exact mint.** It is `#e2f0df` with a `#9fcf99` outline. It is not the app theme's own success color, which is brighter. It is one value in `src/utils/styles.ts` if you want it greener, greyer, or lighter.
- **The whole card is clickable with the mouse only.** The Open Plan button is the way to open a plan with the keyboard.
- **Clicking a card also happens when selecting text on it,** so selecting text on a plan card opens the plan.
- **Cohort cards are not clickable as a whole.** Only the plan cards were asked for.

**How it was checked:** The project type-checks, all unit tests pass (new ones cover the shared name window and the status tag's text, fill, and contrast), and lint reports no new problems. In the browser we checked the new menu, renaming a plan (blank, unchanged, and changed names, then restoring it), setting a plan active and inactive from the menu, clicking the card title and a statistic, Edit Groups, Edit Students, Open Plan, the dividers on both cards, and the colors of the tag.

**Technical notes:**

- The rename window was split into a shared `src/components/EditNameDialog.tsx`. `EditCohortNameDialog` and the new `EditPlanNameDialog` are thin wrappers around it.
- The plan page reads `?edit=groups` or `?edit=students` to set which details start out showing.
- The card lift and pointer style is shared in `src/utils/styles.ts`.
- New `PlanStatusChip.tsx` is the status tag. Its colors are `ACTIVE_STATUS_SURFACE` and `ACTIVE_STATUS_BORDER` in `src/utils/styles.ts`.
- The star component is no longer used on the plan card. It is still used on the student cards.

---

### 6. Create New Plan window: cohort, "Plan N" names, minimums, group size range, Optimize, and a live preview

**Before:** Pressing New plan made a plan at once, named "New Plan", with no choices. The button sat above the plan list on the cohort page, and the home page's cohort cards had their own New plan button that did the same.

**After:** New plan opens a window titled "Create New Plan", where you shape the plan and see the result before it is created.

What a user will notice:

- **New plan opens the Create New Plan window,** both from the cohort header (Change 3) and from the New plan button on the home page's cohort cards. The old New plan button above the plan list is gone.
- **The window shows the cohort and asks for three things, with the live preview above the sliders:**
  - **A cohort and a name.** A "Cohort" field with the cohort's name sits to the left of the "Plan name" field. Both have the same small label on the top edge of the box, the same height, and the same text size, so their text lines up. The cohort field is shaded light grey, cannot be edited, and is skipped when tabbing, so the cursor starts in Plan name. When the window is too narrow for both side by side, they stack, cohort first. The plan cannot be created without a name.
  - **Minimum overlap,** from no minimum up to 8 hours in half-hour steps. This is the least shared time a group may be left with.
  - **Group size,** one slider with a handle at each end, from 1 to 15 students. The left handle is the smallest group allowed (all the way left means no minimum), and groups smaller than this are broken up. The right handle is the largest group allowed, starting at 10, which is what every plan had before. The text above the slider reads, for example, "Up to 10 students", "5 to 10 students", or "Exactly 6 students". The handles cannot cross.
- **The name starts as "Plan N".** N is one more than the highest number among the cohort's plans that still have a default name.
  - A cohort with no plans starts at "Plan 1", then "Plan 2", "Plan 3", and so on.
  - A plan renamed to anything else stops counting. If "Plan 1" is renamed and it was the only default named plan, the next new plan is "Plan 1" again.
  - Numbers are not reused while a higher one exists. If "Plan 3" exists but there is no "Plan 1", the next new plan is "Plan 4". The same is true if "Plan 1" is renamed while "Plan 2" and "Plan 3" exist: the next plan is "Plan 4".
  - Only names that are exactly "Plan" and a number count. "New Plan", "Plan B", "Plan 2 final", and "Final" are ignored. Capitals and spaces around the name do not matter ("plan 5" counts as 5), and "Plan 007" counts as 7.
  - It counts the plans in the cohort the window was opened from, so two cohorts can each have a "Plan 1".
  - The name can still be changed before creating, and a name the user typed is never replaced. If the cohort's plans change while the window is open, the suggested name updates until the user types their own. Each time the window is opened it starts again from the suggested name.
- **The preview updates as the settings change.** It is the same totals and charts as a plan card (Change 4), starting with the numbers of groups, students, and waitlisted students, then the three charts, then the sliders with the Optimize button at the bottom. It is the real grouping, run on the cohort's students, so the plan that gets created comes out the same.
- **An Optimize button sits under the sliders,** to the right of the line about the waitlist. It tries to find an arrangement of the same students that leaves fewer of them on the waitlist.
  - **It compares 50 groupings.** Each one places the students in a different shuffled order (anchor students still go first) and builds the groups with the current settings. The one that waitlists the fewest students is kept. If two tie, the one with more shared time in all wins.
  - **While it works, the window shows "Comparing groupings"** with a progress bar and a count such as "5 of 50". The bar fills as each of the 50 is compared, which takes about a second. The sliders, the name, Cancel, and Create plan are turned off until it finishes.
  - **When it finishes, the preview shows the best grouping** and a line says what happened: "Found a grouping that waitlists fewer students: from 12 to 9.", or "No other grouping waitlisted fewer students than N." when nothing beat what was there.
  - **It never makes things worse.** Pressing it again starts from different shuffles, so it can keep improving. On the 48 student cohort it took the waitlist from 12 to 9 in one press.
  - **Create plan builds exactly the grouping shown in the preview.** The chosen order is passed to the plan builder, so the saved plan has the same groups and the same waitlist. We checked this: the saved plan had 5 groups, 9 waitlisted, and group sizes 5, 7, 7, 10, 10, the same as the preview.
  - **Changing a slider drops the optimized arrangement,** the line about it goes away, and the preview goes back to the fixed order for the new settings. Press Optimize again to search again.
- **Nothing is saved until Create plan is pressed.** The plan is then created and you are taken to its page. While it is being made, the window shows "Creating..." and its buttons are off. Cancel creates nothing. If creating fails, a message appears and the window stays open.
- **A student who cannot join any group within these limits goes on the waitlist.**

How the settings work with the grouping:

- **The grouping is the same one-pass method as before.** **The number of groups is worked out automatically, not fixed at 5:** enough empty groups are made to seat every student at the largest group size, which is the number of students divided by the largest size, rounded up. The 48 students at 10 per group give 5, and the cohort only shows 5 groups because of its size. Moving the right handle changes the count: on the 48 student cohort, a largest size of 4 gives 12 groups, 5 gives 10, 6 gives 8, 8 gives 6, 10 gives 5, and 12 or 15 gives 4. A group that ends up empty is dropped, and a minimum group size can break up more. Students are then placed one at a time, anchor students first, each into the group they share the most time with. A student who fits nowhere is waitlisted.
- **Minimum overlap** is checked as each student is placed: a student only joins a group if the group would still share at least that many hours afterward. So every group ends with at least the minimum. It is measured in real shared time, the same figure shown on the charts.
- **Minimum group size** is applied at the end. The smallest group that is too small is broken up, and its students are placed into the other groups where they fit. This repeats until every group is big enough. Students who fit nowhere are waitlisted, and the groups that are left are renumbered.
- **With no minimums and no Optimize, the result is the same method as before,** with the two exceptions below (a fixed order, and empty groups removed).

**Decisions to confirm:**

- **What is saved with the plan.** The largest group size is saved as the plan's group size, so it shows in the plan's settings and rebuilds use it. The two minimums and the arrangement Optimize chose are not saved. They only shape how the plan is first built. If someone later changes the plan's group size in its settings, the plan is rebuilt in the fixed order without them. Keeping them would need new columns in the plan table, which is a database change for the maintainers to review.
- **A smaller largest group size does not always shrink the waitlist.** On the 48 student cohort, with the fixed order, the waitlist is 4 at a largest size of 4, 6 at 5 and 6, 11 at 8, 12 at 10, and 14 at 12. Smaller groups are easier to fit students into, but they share time with fewer students and need more groups.
- **Students are now placed in a fixed order** (anchors first, then by student id), so the preview and the created plan always agree. Before, the order was whatever order the database returned. On the same students, a plan built now can differ from one built before. For the 48 student cohort, a plan with no minimums now has 12 on the waitlist, where older plans had 6 to 15.
- **A group that ends up empty is now removed.** Before, an empty group could stay in the plan. A minimum group size of 1 means a group needs at least one student.
- **The waitlist can grow a lot with a high minimum group size.** Breaking up groups strands students that a different arrangement could have kept. On the 48 student cohort the waitlist goes from 12 with no minimum to 15 at a minimum of 5, 29 at 8, and 38 at 10. The preview shows this as you move the slider.
- **Optimize works by trying many shuffles, and changes who is in which group.** The result depends on the order students are placed in: shuffling the order on the 48 student cohort gave waitlists from 7 to 24 with no minimums. Only about a third of the pairs of students grouped together stay together from one shuffle to another, so an optimized plan can look quite different from the default one. A single random shuffle is a gamble (it was better than the fixed order 30% of the time and worse 56% of the time), which is why Optimize keeps the best of 50. The best of 20 shuffles averaged 8.6 waitlisted against 12 in the fixed order, and the best of 100 averaged 7.6, so more than 50 would help a little more.
- **"Better" only means fewer waitlisted students,** then more shared time in all. It does not look at countries per group or group sizes. Those could be added to how groupings are scored.
- **Plans already called "New Plan" are left as they are** and are not counted. Existing cohorts will start at "Plan 1", even if they have six plans named "New Plan". Renaming them in bulk would be a data change we did not make.
- **Where the number comes from.** The "Plan N" number is worked out from the plans loaded with the cohort when the window opens, so two people creating a plan at the same moment could both be offered the same name. Nothing prevents two plans having the same name, as before.
- **A plan made without the window** (the cohort service's `createPlan` with no name) is named the same way. The plan editor's own "empty plan" default is still "New Plan"; nothing uses it for new plans now.

**How it was checked:** The project type-checks, all unit tests pass (new ones cover the grouping, including both minimums, the waitlist, ordering, shuffling, Optimize, and that the students passed in are left unchanged; the naming rule with the "Plan 3 with no Plan 1" and "Plan 1 renamed" cases, other names, capitals, spaces, and plans in any order; and the window's cohort field, default name, settings, preview, Optimize progress, and creation), and lint reports no new problems. In the browser we opened the window from the cohort header and the home card, moved the sliders and watched the preview, ran Optimize and watched the progress bar, created a plan, and compared the saved plan with the preview: groups, waitlist, group sizes, countries per group, and shared hours all matched, and every group met both minimums. The window offered "Plan 1" for a cohort with no "Plan N" names. That test plan was then deleted, with nothing left behind.

**Technical notes:**

- New `src/services/plan/planGeneration.ts` does the grouping with no database access, so the window can run it on every change and the created plan uses the same code. `PlanGenerator.run` now calls it and then saves, and takes the minimums as options. The generator's old placement methods moved into it.
- `planGeneration.ts` has a `shuffleSeed` setting (a seeded shuffle of the placement order, anchors first, same seed gives the same order) and `optimizeGrouping`, which runs `generatePlan` for 50 seeds, reports progress after each, and returns the best seed. `NewPlanDialog` runs it with a 15 millisecond pause after each comparison so the progress bar can be followed, and passes the chosen seed to `CECohortService.createPlan`, which hands it to `PlanGenerator.run`.
- `CECohortService.createPlan` and `CEPlanService.create` accept a name, the minimums, the largest group size (saved as the plan's `group_size`), and the shuffle seed.
- New `src/services/plan/planNaming.ts` has `nextDefaultPlanName(plans)`, used by `NewPlanDialog` (the name field shows the typed name, or the default until something is typed) and by `CECohortService.createPlan`.
- New `src/components/NewPlanDialog.tsx`. The group size control is a two handle MUI `Slider` (`disableSwap`, range 1 to 15), with the handles labelled "Minimum group size" and "Maximum group size" for screen readers. The Cohort and Plan name fields are in a wrapping flex row, so they stack by available room rather than by screen breakpoints. The preview uses the shared `PlanSummary` from Change 4.
