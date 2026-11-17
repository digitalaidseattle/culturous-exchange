# Culturous Exchange: Site Changes

This document tracks how the site differs from where it started and where we are taking it.
It is written for people, not developers. Each entry says what a user will notice, with a short
technical note at the end for whoever reviews the code. Entries describe the net result, not the
steps taken to get there.

- **Starting point:** the `dev` branch on 2026-10-27 (commit `35ce46d`)
- **Working branch:** `aidan/onboarding`
- **Last updated:** 2026-11-17
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
- The home page opens with a welcome banner that says what the site is for and where to start. *(Change 2)*
- A floating button on the home page creates cohorts and imports student lists. *(Change 2)*
- New Cohort opens a Create Cohort window that asks for a name and the students' file, then slides to the Create New Plan settings for the new cohort. *(Change 7)*
- Under the welcome banner, a Get Started card walks through naming a cohort, dropping a students file, and generating the cohort and its first plan in one go. *(Change 8)*
- The page for a plan shows each group as a card with its students, its shared time on a little weekend calendar, and a globe of the cities it covers, with the waitlist in a side panel. Students are moved with a Change group window. *(Change 9)*
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
| 7 | New Cohort opens a two step Create Cohort window: name and students file, then the plan settings | Built and checked locally, not yet committed | 2026-11-04 |
| 8 | Get Started card from the maintainers' pull request 185 added to the home page | Built and checked locally, not yet committed | 2026-11-04 |
| 9 | Groups page redesigned: a card for each group, availability calendars, a waitlist side panel, Change group and See details windows, and globes | Built and checked locally, not yet committed | 2026-11-04 |
| 10 | The team's latest work (the `dev` branch) brought in and reconciled with the redesign | Merged locally, not yet pushed | 2026-11-16 |
| 11 | Home page lists the current cohort once; the cohort page gets charts of its students, with a globe for countries | Built and checked locally, pull requests open | 2026-11-17 |
| 12 | MUI charts only: the globe and the dot plots are replaced with MUI X Charts (branch `aidan/onboarding-mui-only`) | Built and checked locally, not pushed | 2026-11-17 |
| 13 | Each cohort card on the home page shows the same facts and charts as the cohort's page | Built and checked locally, not pushed | 2026-11-17 |

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

- **A welcome banner** opens the page with the title "Welcome to Culturous Exchange", a line saying what the site is for (build cohorts, make plans, and schedule culturous exchange), and a "Get started" line pointing to the Current Cohort or to planning for the future. It is text only, with no buttons.
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
- **The welcome banner is not in the mock.** The wording is as given, and the title "Welcome to Culturous Exchange" is ours. "Current Cohort" and "Start planning for the future" are plain text. Making them links (to the current cohort and to creating a new one) is possible.
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
- **The active plan is shown right under the summary panel, below an "Active Plan" heading,** above the tabs, so it stays in view on either tab. It is the same card as in the list and is left out of the list below so it does not appear twice. The Plans tab is now called "Inactive plans" to match. With no active plan, nothing is shown there. If the active plan is set inactive, it moves back into the list.
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
- `planGeneration.ts` has a `shuffleSeed` setting (a seeded shuffle of the placement order, anchors first, same seed gives the same order) and `optimizeGrouping`, which runs `generatePlan` for 50 seeds, reports progress after each, and returns the best seed. The panel runs it with a 15 millisecond pause after each comparison so the progress bar can be followed, and passes the chosen seed to `CECohortService.createPlan`, which hands it to `PlanGenerator.run`.
- `CECohortService.createPlan` and `CEPlanService.create` accept a name, the minimums, the largest group size (saved as the plan's `group_size`), and the shuffle seed.
- New `src/services/plan/planNaming.ts` has `nextDefaultPlanName(plans)`, used by `NewPlanDialog` (the name field shows the typed name, or the default until something is typed) and by `CECohortService.createPlan`.
- New `src/components/NewPlanPanel.tsx` (with `NewPlanDialog.tsx` as the window around it; see Change 7). The group size control is a two handle MUI `Slider` (`disableSwap`, range 1 to 15), with the handles labelled "Minimum group size" and "Maximum group size" for screen readers. The Cohort and Plan name fields are in a wrapping flex row, so they stack by available room rather than by screen breakpoints. The preview uses the shared `PlanSummary` from Change 4.

---

### 7. New Cohort opens a two step Create Cohort window

**Before:** New Cohort made a cohort at once, named "(New) Cohort", and put in every student who was not in a cohort yet. To bring in a spreadsheet of students you used the separate Import Student List action, and the cohort had to be renamed and given a plan afterward.

**After:** New Cohort opens a "Create Cohort" window that walks through two steps.

What a user will notice:

- **Both New Cohort buttons open it:** the one beside "All Cohorts" and the one in the floating button's menu.
- **Step 1 is "Create Cohort".** It asks for the **Cohort name** and the **Students file**, a dashed box to drag a spreadsheet onto or click to choose one. The chosen file's name is shown, with a button to take it out again. Only Excel files (.xlsx or .xls) are accepted, and anything else says so. The buttons are **Cancel** and **Next**. Next stays off until the cohort has a name. Pressing Enter in the name field does the same as Next.
- **Next adds the file's students, creates the cohort, and slides to step 2.** While it works, the button reads "Creating cohort..." and Cancel and the fields are off. The new cohort appears in the list behind the window as soon as it exists.
- **Step 2 is the Create New Plan window, with the same contents** as the one opened by New plan (Change 6): the cohort, the plan name ("Plan 1"), the live preview, the two sliders, and Optimize, for the new cohort and its students. Create plan makes the plan and opens it, the same as before.
- **If some rows of the file cannot be added,** the cohort is still made with the rest, a message says how many were added and failed, and the "Profiles that require attention" list opens.
- **If no student can be added,** no cohort is made. The list of problems opens and the window stays on step 1, so another file can be chosen.
- **With no file chosen,** the cohort starts with the students who are not in a cohort yet, as New Cohort always did.
- **Cancel on step 1** closes the window and makes nothing.

**Decisions to confirm:**

- **Cancel on step 2 keeps the cohort.** The cohort and its students are made when Next is pressed, because the plan preview needs the students' times, which are worked out as they are added. Cancelling on step 2 closes the window and leaves a cohort with no plan; a plan can be added from the cohort page. The other way is to make nothing until Create plan, which would mean working out the students' time zones (an outside lookup) before anything is saved, just to preview.
- **No Back button on step 2,** since the cohort already exists by then. It was not asked for.
- **The file is optional.** The mock asks for one; leaving it out keeps the old "use everyone not in a cohort" behavior, which is how students uploaded on the Students page get into a cohort.
- **Uploading new students needs a working time zone lookup.** Students from a spreadsheet are looked up by city, for their time zone, through a paid outside service. On this machine the key in `.env.local` is a placeholder, so rows whose city is not already known fail with "Failed to fetch timezone". That is the same for the Students page upload and Import Student List, and was not changed.

**How it was checked:** The project type-checks, all unit tests pass (new ones cover the window's two steps, the file box, the cases above, and the cohort and upload services), and lint reports no new problems. In the browser we opened the window from New Cohort, tried a file whose students all failed (the window stayed on step 1 with the list of problems), made a cohort with no file (the window slid to the plan step showing the new cohort and "Plan 1", the list behind it updated, and Cancel closed it), and then deleted that test cohort. A file whose students are added successfully could not be tried in the browser because of the time zone key, so that path is covered by the unit tests only.

**Technical notes:**

- New `src/components/CreateCohortDialog.tsx` (the window and its two slides), `src/components/StudentFileDropzone.tsx` (the file box, using `react-dropzone`), and `src/services/student/uploadStudents.ts` (adds the students from files and returns who was added and who failed).
- The contents of the Create New Plan window moved into `src/components/NewPlanPanel.tsx`, which both `NewPlanDialog` and the second step use. Behavior of the New plan window is unchanged, and its tests pass untouched.
- `createCohort` (`src/services/cohort/createCohort.ts`) takes an optional name and optional list of students. With no list it enrols the students who are not in a cohort, as before. It now uses `addStudentsToCohort` instead of its own copy of the enrolment code.

---

### 8. Get Started card from pull request 185 added to the home page

**Before:** The home page had the welcome banner, then the Current Cohort. New cohorts were made from New Cohort (Change 7).

**After:** A **Get Started** card sits between the welcome banner and the Current Cohort. It is the card from the maintainers' pull request 185 ("stepped cohort creation"), added as asked and not changed in how it works.

What a user will notice:

- **A card with a green to blue header and three steps down the left:**
  1. **Enter a name for the cohort.** Next checks the name against the existing cohorts, ignoring capitals, and says "A cohort with this name already exists." if it is taken.
  2. **Drop a file of students.** Each file is checked as soon as it is dropped. A file that cannot be opened, is empty, or is missing columns is shown in red, and hovering it says what is wrong. Next stays off until every file is fine.
  3. **Generate the cohort and plan.** One button adds the students, creates the cohort, builds a plan with the usual settings, and opens the plan. If the plan cannot be built, you land on the cohort instead.
- **Spreadsheets are now checked for the required columns before any student is added.** This applies to the Students page upload, Import Student List, and the Create Cohort window too: a file with missing columns now stops with a message naming them, instead of failing row by row.

**Decisions to confirm:**

- **There are now two ways to make a cohort on this page:** this card, which makes the cohort and a plan with the standard settings, and New Cohort (Change 7), which stops at the plan settings so the group size and minimums can be chosen. The card also checks for a duplicate cohort name, and New Cohort does not yet. Keeping both, merging them, or adding the duplicate check to New Cohort are all easy.
- **The header was made readable.** In the pull request the line "Create a cohort and a plan" was grey on the gradient, and the white title was weak at the green end. The header now has dark text, the app's usual text color, on a light green to light blue gradient, at 8.6 to 1 contrast or better.
- **This is a copy of the pull request's changes, not a git merge.** Its home page rewrite (a second Current Cohort card, which is not used here) was left out, and two names were adjusted so they do not clash with ours: the welcome banner's "Get started:" label, and the cohort-creating function, which takes a name inside an options object. A later real merge of the maintainers' branch will report conflicts in the home page, the constants, and `createCohort.ts`.
- **It fails to add students here for the same reason as other uploads:** the placeholder time zone key (Change 7).

**How it was checked:** The project type-checks and all unit tests pass (including the pull request's own spreadsheet checking tests). In the browser we confirmed the card sits between the banner and the Current Cohort. We did not run it through to the end, since that would add students and a cohort and the upload fails without a real time zone key. Lint reports 3 more errors than before, all in the pull request's code (loose `any` types in the spreadsheet reader).

**Technical notes:**

- Added from the pull request: `src/pages/home/GetStartedCard.tsx`, `nameExists` on the cohort dao and service, `validate_excel` and `requiredColumns` in `ProfileUploader` (with `StudentUploader` and `FacilitatorUploader` listing their columns), the pull request's `ProfileUploader.test.ts`, and its button and message strings in `src/constants.ts`.
- Not taken: `CurrentCohortCard.tsx` and the pull request's version of `src/pages/home/index.tsx`.

---

### 9. Groups page redesigned

This is the page that opens from a plan card ("Open Plan", "Edit Groups" or "Edit Students"). It was a board of columns you dragged student cards between.

**Before:** A bordered box with a toolbar of icons held the plan's name and notes, and below it a board with one column for each group and one for the waitlist. Student cards were dragged between columns, with a star to set the anchor flag. Two toolbar icons showed or hid more detail on the groups and the students.

**After:** The page follows the style of the cohort and plan pages.

What a user will notice:

- **A header card like the cohort page's,** with the plan's name and notes (still edited in place), the numbers of groups, students and waitlisted students, and Export plan and Show plan settings as buttons. **Groups** is a heading below it, with **Cards** and **Timeline** buttons to switch views. The timeline view is unchanged.
- **Each group is a card, one under the next,** and the page scrolls. A card shows:
  - The group's name and facilitator (or "No facilitator yet"), with chips for the number of students, the number of countries, and the hours of shared time (red "No shared time" when there are none), and a three dot menu for the group's facilitators, as before.
  - **The students as compact cards**, anchors first and then by name. A card has the name, the country with its flag, and for anchor students an **Anchor** badge with an anchor icon to the right of the name. When the name and the whole badge do not fit on the line, the badge shrinks to just its icon (still named "Anchor" for screen readers, and as a tooltip), so every card stays the same height.
  - **Two containers, Location and Shared time, side by side with the students below.** Each has a border and a title. They sit in one row while there is room, and the shared time moves under the location on a narrow screen. The Shared time container is capped in width, so the calendar does not stretch across the card.
  - **Location:** the container is dark charcoal, with a white title. The globe in it has pale blue sea and land colored as a soft gradient of what it is like: forest and rainforest in greens, grassland in light green, desert and dry land in sand, rocky and mountain ground (such as the Himalaya and the Andes) in warm grey, tundra in pale grey-green, and ice white, so the Sahara, the Amazon, the Siberian forest and Greenland can be told apart. The colors fade into each other rather than stopping at hard edges. Each city is a dot, colored by country in soft, light colors, each dot with a thin darker edge so it still shows. **The key of countries, with how many students are from each, is to the right of the globe, in a white container** (it drops below on a very narrow screen). The globe opens turned to face the dots and can be dragged to turn it. The globe in the See details window has the same land.
  - **Shared time:** "Days available" at the top right lists the days with their times, for example "Fri (5pm to 9pm), Sun (8am to 10am)". Under it is a little weekend calendar, which is as tall as its container (so it is as tall as the Location container beside it): Friday, Saturday and Sunday side by side, each a strip, with the overlap drawn as a solid bar in the theme's blue. A day with no shared time is shaded and drawn a quarter as wide as a day with some. The calendar is in Pacific time, the time the plan's groups are scheduled in, and says so to screen readers.
  - **Plan header:** the plan's name is now the page's main heading, in the same style as a cohort's name, with a small "NAME" label above it and a pencil beside it to rename it (Enter saves, Escape cancels). The totals of groups, students and waitlisted students come next, and below them **Notes is a text entry field** that is always there to type in, even when empty. Notes save when you click out of the field (or press Control or Command with Enter) and the page stays as it is, without reloading.
  - **No more page reset on changes:** setting or removing an anchor, moving a student, or saving a name or note used to blank the whole plan page and load it again (the globes redrew and the page jumped). Now only the part that changed updates, and the page stays where it is.
  - **Plan settings window reworked:** it now has the same two sliders as Create New Plan (the least shared time, and the range of group sizes) and the same preview: the numbers of groups, students and waitlisted students, and the three charts. When it opens it shows the plan as it is now; once a slider moves, or Optimize is pressed, it shows the grouping those settings would make. The buttons are **Cancel**, **Optimize** and **Update plan**. Optimize only searches for a better grouping and shows it in the preview; **only Update plan regroups and saves the plan**, and the window shows it is working until that finishes (and stays open if it fails). A note in the window says that updating replaces moves made by hand and keeps anchors. The sliders and preview are shared code with Create New Plan, so the two windows behave the same.
  - **Group summary:** the three numbers that used to be small tags at the top right of each group card (students, countries, and hours of shared time) now sit in their own tinted panel, in the third spot of the same row as Location and Shared time, styled like the totals panel on a plan card: big numbers with a small label under each. When a group shares no time, the number is a red 0 labeled "No shared time". Under the numbers is a **gender split bar**, a thin bar in soft colors (female, male, other) sized by how many students are in each, with the counts beneath it. A gender that nobody in the group has is left out, and anything other than female or male, or left blank, counts as other.
  - **Parts of the day with no shared time are left out of the calendar.** The day is split into morning (7am to noon), afternoon (noon to 5pm) and evening (5pm to 10pm), as on the students' form. If no day has shared time in one of them, it is hidden and the hours that are left fill the same height, so they are drawn larger and the times down the side are named more finely (for example every hour for a morning alone). When hidden hours sit between two parts that are shown, a hatched mark shows that hours were skipped. With no shared time at all, the whole day is shown. This applies to the calendars in the group card and in the See details window, not to the tiny ones in the Change group list.
- **The waitlist is a side panel** at the right of the groups, with the same compact student cards and a count. It stays in view while the groups scroll, and scrolls itself when it is long. On a narrow screen it moves below the groups.
- **Each student card has a three dot menu with See details and Change group.** It also has **Set as anchor** or **Remove anchor**, which replaces the old star (not asked for; see below).
- **See details** opens a window of cards: **Profile** (name, anchor badge, age, gender, email), **In this plan** (the group, or Waitlisted, and whether they are an anchor), **Location** (city, state or region, country with flag, time zone, and a globe with a marker on their city), and **Availability** (the same little calendar, and the times in words).
- **Change group** opens a window with the student's card and availability at the left, and at the right a list of the plan's groups, each a card to choose. A group card shows the number of students, the countries, and how much time the student has in common with the group (in blue, to match the calendars), with a small calendar of it. **A group the student shares no time with is outlined and tagged in red** ("No shared time with Maria"). The student's own group is marked "Current group" and cannot be chosen. A **Waitlisted** choice is at the end. The button reads **Move to group** and is off until a group is chosen, then reads, for example, **Move to Group 2**. Moving saves the plan, closes the window, and says "Maria moved to Group 2."

**Decisions to confirm:**

- **Dragging students between groups is gone.** Students are moved with Change group. The old board and its drag and drop code were removed from this page (the timeline view still has its own).
- **Anchor is changed from the three dot menu,** not from a star. This was not in the list of menu items, but removing it would remove the only way to set the flag, so Set as anchor and Remove anchor are a third menu item. It is easy to take out.
- **The group and student detail toggles are gone,** since the cards always show them. "Edit Groups" and "Edit Students" on a plan card now open the same page, with nothing extra showing.
- **The waitlist is offered in Change group,** so a student can be taken out of a group as well as put in one, as dragging allowed.
- **"Overlap with the group" means the time the student shares with the group's current shared time.** If the student moves in, that is the group's shared time afterward. This is what the red tag and the hours shown mean.
- **The calendar covers Friday to Sunday, 7am to 10pm Pacific time, less any part of the day with no shared time.** That is the span groups are scheduled in, so a student's time outside it is not drawn or counted. A student in Asia, for example, may show only a few hours in it.
- **The terrain is rough, and comes from a coarse map.** The globe's land is colored from a map of 3 degree squares (about 330 km), made once by sorting a day time picture of the earth into eight kinds of land by color, and treating high ground as rock. It shows the broad character of a region, not its detail: a city in a river valley in the desert will sit in desert color. The map is a small data file in the project (`src/utils/terrainGrid.ts`, about 9 KB) and nothing is loaded when the page is shown. The picture used was the Earth day image from the three-globe examples, which is made from NASA and Natural Earth imagery; the project's license for that picture should be confirmed by the maintainers before this is released.
- **The picture on the globe is drawn again as it is turned** (a small bitmap, at half the globe's size), which is quick for one globe and could be slow for a very long page of groups if all of them were turned at once.
- **Dots are colored by country, not by city.** The key under the globe then explains them. A city that cannot be found has no dot, and the card says how many were not placed.
- **Students have no coordinates stored, so cities are looked up when a card is shown,** with the free Open-Meteo place search (no key) called from the browser. Only the city, state and country are sent. Results are kept in the browser so each place is looked up once. Saving coordinates when students are uploaded would avoid this, and needs new columns in the student table, a change for the maintainers.
- **Three new open source packages** for the globe: `d3-geo` (the map projection), `topojson-client` and `world-atlas` (the coastlines, from Natural Earth).

**Globe options considered:**

| Option | Notes |
|---|---|
| Our own SVG globe (`d3-geo` with `world-atlas`), **used** | Small, no map service or API key, works offline, easy to test and style, and the globe is the same in every card. Flat shading only, no zoom. |
| `cobe` | A tiny (about 5 KB) WebGL globe with dots that looks very polished. Draws dots for land rather than coastlines, and cannot be inspected or tested without a GPU. |
| `react-globe.gl` / `globe.gl` | Full 3D with textures, arcs and labels. Heavy (it brings in three.js), and a lot for a small card. |
| MapLibre GL JS (globe projection) | A real map you can zoom to the street, with open map tiles. Needs a tile source, which is more to set up and pay attention to, for a small picture. |
| Leaflet | A flat map, not a globe. |

**How it was checked:** The project type-checks and builds, all unit tests pass (new ones cover the weekend calendar and its time conversion, the globe, the city lookup and its cache, the student card and menu, the group card, the waitlist panel, both windows, and the page, including moving students, failed moves and the anchor flag), and lint reports fewer problems than before. In the browser we opened a plan, looked at the cards, the calendars, the globes and the waitlist panel, opened See details and Change group, and moved a student to another group and back: the page, the notification and the database all agreed, and the group's times returned to how they were. The Timeline button still works.

**Technical notes:**

- New: `PlanGroupCard`, `PlanStudentCard`, `WaitlistPanel`, `ChangeGroupDialog`, `StudentDetailsDialog`, `AvailabilityCalendar`, `AnchorBadge` and `Globe` in `src/components`; `GroupsView` in `src/pages/plan`; `src/utils/weekendGrid.ts` (time windows to the calendar), `src/utils/globeView.ts` and `src/utils/globeColors.ts`; `src/services/plan/groupFit.ts` (how a student fits a group); and `src/services/geo` (the place lookup, its cache, and a hook).
- Removed: `GroupBoard`, `GroupCard`, `StudentCard` and `StarAvatar`.
- `src/pages/plan/index.tsx` was restyled. `src/utils/countryFlag.ts` gained `countryCode`, which the place lookup uses to narrow results to the right country.

---

### 10. The team's latest work brought in and reconciled

While this redesign was being built, the maintainers kept working on the shared `dev` branch. On 2026-11-06 that work was merged into this branch (13 changes from them), and where both sides had rebuilt the same screen, the redesign was kept and the useful parts of their change were carried into it.

**What you will notice:**

- **Create Cohort checks the name.** If another cohort already has the name, the window stays on the first step and says "A cohort with this name already exists." before anything is uploaded or created. If the name cannot be checked, it says so instead of going on. (This is the check the maintainers added to the Get Started card; the card keeps it, and the window now has it too.)
- **A failed cohort delete is reported.** If deleting a cohort fails, a "Deletion failed" message appears and the window closes, instead of closing as if it had worked. Deleting a cohort now also removes its plans and their groups and times, through a new database migration from the maintainers.
- **The Timeline view keeps the maintainers' two buttons** (show group details, show student details), which now sit at the right of the Cards / Timeline switch and appear only in the Timeline view.

- **Plan settings has a Generation method** (from the maintainers' CEMT-95): Most Availability, Least Availability, Balanced Groups or Random. It starts from the plan's own method, the preview changes with it, and Update plan saves it. A group with no students yet is always filled first, whatever the method. Random gives the same groups every time for the same preview, so what you see is what is saved.

**What was set aside, for you to decide:**

- The maintainers also added their own home page, with a **Current Cohort** dashboard of pie and bar charts (countries, gender, ages). The home page in this branch is the redesign, so that card is in the code but is not shown. It would need a place in the new home page layout if you want it.
- Their older plan page header (the name and notes as two small fields, and the toggle buttons in a toolbar) and a "Cohorts" step in the breadcrumb were replaced by the redesigned plan header.

**Technical notes:**

- Conflicts were in `constants.ts` (both sets of strings kept), `createCohort.ts` (this branch's options-object version kept; it already adds students with their anchor flag), `home/index.tsx`, `home/GetStartedCard.tsx`, `plan/index.tsx`, `package-lock.json` (regenerated), and three files deleted here but changed there (`CohortCard`, `StudentCard`, `GroupBoard`; their changes were carried over as described above or already existed in the replacements: the student card already shows the country).
- `generatePlan` now handles the four `optimization_style` values (`largest_first`, `smallest_first`, `balanced`, `random`; `random` uses the shuffle seed so the preview matches the saved plan), `useGenerationControls` carries the style, and `PlanSettingsDialog` has the select. `planGenerator.ts` keeps this branch's version, which calls `generatePlan`, so the maintainers' copy of the placement code was dropped.
- `CreateCohortDialog` calls `CECohortService.nameExists`; two tests cover it. New dependency from the maintainers: `@mui/x-charts`.

---

### 11. The current cohort is listed once, and the cohort page has charts

**What you will notice:**

- **The home page no longer lists the current cohort twice.** It is shown in the **Current Cohort** section, and the list under it is now called **All Other Cohorts** and leaves it out. When the current cohort is the only one, the list says "No other cohorts yet." (the New Cohort button beside the heading stays).
- **The cohort page shows charts of the cohort's students**, inside the summary card: **Students by country**, **Students by age** and **Students by gender**. The age bars and the gender pie are the maintainers' charts from their Current Cohort card. In place of their pie of countries there is the **globe** from the groups page: a dot for each city the students are from, colored by country, with a key of the countries and how many students are from each (the key scrolls when there are many countries). The charts are left out for a cohort with no students, and the age chart for a cohort where no student gave an age.
- The maintainers' Current Cohort card itself is still not shown on the home page.

**Technical notes:**

- New `src/components/LocationGlobe.tsx` is the globe with its key of countries, taken out of `PlanGroupCard` so a group's card and the cohort page share it (`PlanGroupCard` behaves as before). New `src/pages/cohort/CohortCharts.tsx` uses `@mui/x-charts` for the bar and pie charts. Tests cover both pages' new behavior.
- Applied the maintainers' migration `000030_cohort_delete_cascade.sql` to the local database with `supabase migration up`.

---

### 12. MUI charts only (branch `aidan/onboarding-mui-only`)

This branch swaps every chart over to one library, MUI X Charts, the one the maintainers already use. **It replaces what Changes 4, 9 and 11 say about the dot plots and the globe.**

**What you will notice:**

- **Plan cards, New Plan and Plan settings show the maintainers' two bar charts, one above the other,** in place of the three dot plots: **Time Overlap per Group (hrs)** (a bar for each group's hours of shared time) and **Students & Countries per Group** (two bars for each group, with a key). Groups are in numeric order (Group 2 before Group 10). The totals (groups, students, waitlisted) are still in their panel, beside the charts when there is room and above them when there is not.
- **The globe is gone.** A group's card has a **Countries** pie chart where the Location globe was, with a slice for each country and its key. The cohort page's **Students by country** is the same pie chart, beside the age bars and the gender pie. The student's **See details** window shows the city, state, country and time zone as text, with no globe.
- **The bar charts are shorter, with rounded bars, and the vertical axis ends on a labeled number** at or above the tallest bar (0 to 15 in fives, say), where it used to run on to an unmarked point above the last label.
- **The gender split bar uses the charts' colors:** Female is the charts' blue and Male their orange (and Other their red), taken from MUI X Charts' own palette, so they match the pies and bars.
- **The Optimize button is now "Optimize Waitlist"**, and the description under Preview says what it does: "Optimize Waitlist tries 50 configurations based on your settings to find a grouping with a smaller waitlist. The plan is not changed until you press Update Plan." (In the Create New Plan window it ends "Nothing is saved until you create the plan.")
- The availability calendars are unchanged.

**Technical notes:**

- New `GroupBarChart`, `PlanCharts` (the two bar charts, from the maintainers' `GroupBarChart` in their interactive plan card) and `CountryPieChart` (with `utils/countryCounts`). `planStats` gains `perGroup`, each group's name, students, countries and hours, in numeric order of the names. `utils/chartAxis` picks the ticks of the vertical axis.
- Removed: `DistributionChart`, `Globe`, `LocationGlobe`, the terrain and place lookup code (`services/geo`), `distribution`, `gradient`, `overlapColors`, `globeColors`, `globeView`, and the packages `d3-geo`, `topojson-client` and `world-atlas` (and their types). The browser no longer looks up city coordinates, which also removes the licence question about the terrain imagery.
- `vitest.setup.ts` stubs the MUI charts (the test browser cannot draw them): a stub carries the props it was given, so tests check what a chart is drawing, not its pixels.
- The built page is about 39 kB smaller (gzipped) than with the globe and dot plots, though MUI X Charts remain.

---

### 13. Cohort cards on the home page show the cohort's facts and charts

**What you will notice:**

- **Each cohort card on the home page** (the Current Cohort and every card under All Other Cohorts) now shows what the cohort's own page shows under its name: **Students, Plans, Active plan and Created**, then the three charts, **Students by country** (pie), **Students by age** (bars) and **Students by gender** (pie), then the same buttons as before. A cohort with no students has no charts.
- **The home page content is wider** (up to 960 pixels, as on the cohort page) so the three charts sit in a row. The welcome banner, the Get Started card and the cohort cards all have the same width. On a narrow window the charts wrap, and a wrapped chart no longer stretches the whole width.

**Technical notes:**

- New `src/pages/cohort/CohortFacts.tsx` is the row of facts, now shared by the cohort page and the home card. The home card also uses `CohortCharts`. The cohort list already loads each student, so there is no new query. New tests: `CohortFacts.test.tsx` and `CohortCard.test.tsx`.
