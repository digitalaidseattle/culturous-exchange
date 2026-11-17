/**
 *  NewPlanDialog.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const navigate = vi.hoisted(() => vi.fn());
const createPlan = vi.hoisted(() => vi.fn());

// the notification helper comes from the shared library, and creating a plan writes to the database; stand in for them
vi.mock("@digitalaidseattle/core", async () => {
    const React = await import("react");
    return {
        RefreshContext: React.createContext({ refresh: 0, setRefresh: vi.fn() }),
        useNotifications: () => notifications
    };
});
vi.mock("react-router", () => ({ useNavigate: () => navigate }));
vi.mock("../services/cohort/ceCohortService", () => ({
    CECohortService: { getInstance: () => ({ createPlan }) }
}));

import { Cohort, Enrollment, Placement, Student, TimeWindow } from "../api/types";
import { generatePlan } from "../services/plan/planGeneration";
import { CETimeWindowService, DEFAULT_TIMEZONE } from "../services/time/ceTimeWindowService";
import { NewPlanDialog } from "./NewPlanDialog";

const timeWindowService = CETimeWindowService.getInstance();
const DAYS = ["Friday", "Saturday", "Sunday"];
const window = (day: 0 | 1 | 2, from: string, to: string) => ({
    day_in_week: DAYS[day],
    start_date_time: timeWindowService.localTimeToUTC(day, `${from}:00:00`, DEFAULT_TIMEZONE),
    end_date_time: timeWindowService.localTimeToUTC(day, `${to}:00:00`, DEFAULT_TIMEZONE)
}) as TimeWindow;
const WHOLE_WEEKEND = () => [window(0, "07", "22"), window(1, "07", "22"), window(2, "07", "22")];

const cohortOf = (students: Student[], planNames: string[] = []): Cohort => ({
    id: "cohort",
    name: "Cohort",
    plans: planNames.map((name, i) => ({ id: `plan-${i}`, name })),
    enrollments: students.map(student => ({ cohort_id: "cohort", student_id: student.id, student }) as Enrollment)
}) as Cohort;

const student = (id: string, windows: TimeWindow[], country = "Country"): Student =>
    ({ id, name: id, country, timeWindows: windows, anchor: false }) as Student;

// twelve students free all weekend: two groups of six at the default settings
const twelveFree = () => Array.from({ length: 12 }, (_, i) => student(`s${String(i).padStart(2, "0")}`, WHOLE_WEEKEND(), i % 2 ? "Brazil" : "Kenya"));

// thirty students with different free time: in groups of up to 6, the order they are placed in changes who is waitlisted
const mixedStudents = () => {
    let seed = 5;
    const next = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    return Array.from({ length: 30 }, (_, i) =>
        student(`s${String(i).padStart(2, "0")}`, [0, 1, 2].filter(() => next() < 0.6).map(day => window(day as 0 | 1 | 2, "08", String(10 + Math.floor(next() * 8)).padStart(2, "0")))));
};

const renderDialog = (cohort: Cohort = cohortOf(twelveFree()), onClose = vi.fn()) => {
    render(<NewPlanDialog cohort={cohort} open onClose={onClose} />);
    return { onClose };
};

const total = (label: string) => Number(screen.getByText(label).previousElementSibling!.textContent);
const slider = (name: string) => screen.getByRole("slider", { name }) as HTMLInputElement;
const setSlider = (name: string, value: number) => fireEvent.change(slider(name), { target: { value } });
const optimizeButton = () => screen.getByRole("button", { name: /optimize/i }) as HTMLButtonElement;
const waitlistTotal = () => total("Waitlisted students");
const FINISHED = { timeout: 5000 };
const createButton = () => screen.getByRole("button", { name: /create plan|creating/i }) as HTMLButtonElement;

describe("NewPlanDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createPlan.mockResolvedValue({ id: "new-plan", name: "My Plan" });
    });

    describe("settings", () => {
        it("asks for a name, a minimum overlap, and a range of group sizes", () => {
            renderDialog();
            expect(screen.getByText("Create New Plan", { selector: "h2" })).toBeTruthy();
            expect(screen.queryByText("New Plan", { selector: "h2" })).toBeNull();
            expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Plan 1");
            expect(slider("Minimum overlap")).toBeTruthy();
            expect(slider("Minimum group size")).toBeTruthy();
            expect(slider("Maximum group size")).toBeTruthy();
            expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
            expect(createButton().textContent).toBe("Create plan");
        });

        it("shows the cohort's name, labelled Cohort, to the left of the plan name", () => {
            renderDialog();
            const cohortField = screen.getByLabelText("Cohort") as HTMLInputElement;
            const planField = screen.getByLabelText("Plan name") as HTMLInputElement;
            expect(cohortField.value).toBe("Cohort");
            expect(Boolean(cohortField.compareDocumentPosition(planField) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
            // side by side in the same row, so their text lines up
            expect(cohortField.closest(".MuiTextField-root")!.parentElement).toBe(planField.closest(".MuiTextField-root")!.parentElement);
        });

        it("labels the cohort and the plan name the same way: small text on the field's top edge", () => {
            renderDialog();
            const labelOf = (name: string) => screen.getByText(name, { selector: "label" });
            // the plan name has the cursor, so it is focused and the cohort is not
            const muiClasses = (element: Element) => Array.from(element.classList).filter(name => name.startsWith("Mui") && name !== "Mui-focused").sort();
            expect(muiClasses(labelOf("Cohort"))).toEqual(muiClasses(labelOf("Plan name")));
            expect(muiClasses(labelOf("Cohort"))).toContain("MuiInputLabel-shrink");
            expect(muiClasses(labelOf("Cohort"))).toContain("MuiInputLabel-outlined");
            expect(labelOf("Cohort").getAttribute("data-shrink")).toBe("true");
            expect(labelOf("Plan name").getAttribute("data-shrink")).toBe("true");
        });

        it("cannot change the cohort's name from here, and is not a stop when tabbing", () => {
            renderDialog();
            const cohortField = screen.getByLabelText("Cohort") as HTMLInputElement;
            expect(cohortField.readOnly).toBe(true);
            expect(cohortField.tabIndex).toBe(-1);
            fireEvent.change(cohortField, { target: { value: "Changed" } });
            expect(cohortField.value).toBe("Cohort");
        });

        it("keeps the plan name where the cursor starts", () => {
            renderDialog();
            expect(document.activeElement).toBe(screen.getByLabelText("Plan name"));
        });

        describe("the default name", () => {
            const planName = () => (screen.getByLabelText("Plan name") as HTMLInputElement).value;

            it("is Plan 1 for a cohort with no plans", () => {
                renderDialog();
                expect(planName()).toBe("Plan 1");
            });

            it("is the number after the cohort's last default named plan", () => {
                renderDialog(cohortOf(twelveFree(), ["Plan 1", "Plan 2"]));
                expect(planName()).toBe("Plan 3");
            });

            it("is Plan 4 when Plan 3 exists but there is no Plan 1", () => {
                renderDialog(cohortOf(twelveFree(), ["Plan 3"]));
                expect(planName()).toBe("Plan 4");
            });

            it("is Plan 1 again when Plan 1 was renamed and no other plan has a default name", () => {
                renderDialog(cohortOf(twelveFree(), ["Spring groups", "New Plan"]));
                expect(planName()).toBe("Plan 1");
            });

            it("is created with that name when nothing is typed", async () => {
                const cohort = cohortOf(twelveFree(), ["Plan 1", "Plan 2"]);
                renderDialog(cohort);
                fireEvent.click(createButton());
                await waitFor(() => expect(createPlan).toHaveBeenCalledWith(cohort, expect.objectContaining({ name: "Plan 3" })));
            });

            it("does not replace a name the user typed", async () => {
                renderDialog(cohortOf(twelveFree(), ["Plan 1"]));
                fireEvent.change(screen.getByLabelText("Plan name"), { target: { value: "My groups" } });
                expect(planName()).toBe("My groups");
                fireEvent.click(createButton());
                await waitFor(() => expect(createPlan).toHaveBeenCalled());
                expect(createPlan.mock.calls[0][1].name).toBe("My groups");
            });

            it("can be cleared to type something else, which leaves the field empty", () => {
                renderDialog(cohortOf(twelveFree(), ["Plan 1"]));
                fireEvent.change(screen.getByLabelText("Plan name"), { target: { value: "" } });
                expect(planName()).toBe("");
                expect(createButton().disabled).toBe(true);
            });

            it("follows the cohort's plans when they change, until the user types", () => {
                const students = twelveFree();
                const { rerender } = render(<NewPlanDialog cohort={cohortOf(students, ["Plan 1"])} open onClose={vi.fn()} />);
                expect(planName()).toBe("Plan 2");
                // Plan 1 is renamed in the meantime, and Plan 2 is made somewhere else
                rerender(<NewPlanDialog cohort={cohortOf(students, ["Final", "Plan 2"])} open onClose={vi.fn()} />);
                expect(planName()).toBe("Plan 3");
                rerender(<NewPlanDialog cohort={cohortOf(students, ["Final"])} open onClose={vi.fn()} />);
                expect(planName()).toBe("Plan 1");
            });

            it("starts over from the default name when the window is opened again", async () => {
                const cohort = cohortOf(twelveFree(), ["Plan 1"]);
                const { rerender } = render(<NewPlanDialog cohort={cohort} open onClose={vi.fn()} />);
                fireEvent.change(screen.getByLabelText("Plan name"), { target: { value: "Typed" } });
                rerender(<NewPlanDialog cohort={cohort} open={false} onClose={vi.fn()} />);
                await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), { timeout: 5000 });
                rerender(<NewPlanDialog cohort={cohort} open onClose={vi.fn()} />);
                expect(planName()).toBe("Plan 2");
            });
        });

        it("titles the group size control \"Group size\", with one slider and a thumb at each end", () => {
            renderDialog();
            // the setting's title, and the title of the group size chart
            expect(screen.getAllByText("Group size")).toHaveLength(2);
            expect(screen.queryByText("Minimum group size")).toBeNull();
            expect(screen.getAllByRole("slider")).toHaveLength(3);
            expect(slider("Minimum group size").closest(".MuiSlider-root")).toBe(slider("Maximum group size").closest(".MuiSlider-root"));
        });

        it("starts with no minimums and the usual largest group, which are the settings the plan always had", () => {
            renderDialog();
            expect(slider("Minimum overlap").value).toBe("0");
            expect(slider("Minimum group size").value).toBe("1");
            expect(slider("Maximum group size").value).toBe("10");
            expect(screen.getByText("No minimum")).toBeTruthy();
            expect(screen.getByText("Up to 10 students")).toBeTruthy();
        });

        it("says what a minimum is as it changes, with units", () => {
            renderDialog();
            setSlider("Minimum overlap", 1);
            expect(screen.getByText("1 hour")).toBeTruthy();
            setSlider("Minimum overlap", 2.5);
            expect(screen.getByText("2.5 hours")).toBeTruthy();
            setSlider("Minimum group size", 7);
            expect(screen.getByText("7 to 10 students")).toBeTruthy();
            setSlider("Maximum group size", 12);
            expect(screen.getByText("7 to 12 students")).toBeTruthy();
            setSlider("Minimum overlap", 0);
            expect(screen.getByText("No minimum")).toBeTruthy();
        });

        it("says \"Up to\" when there is no minimum size, and \"Exactly\" when both ends meet", () => {
            renderDialog();
            setSlider("Maximum group size", 6);
            expect(screen.getByText("Up to 6 students")).toBeTruthy();
            setSlider("Minimum group size", 6);
            expect(screen.getByText("Exactly 6 students")).toBeTruthy();
            setSlider("Minimum group size", 1);
            setSlider("Maximum group size", 1);
            expect(screen.getByText("Exactly 1 student")).toBeTruthy();
        });

        it("allows overlap in half hours, and group sizes from 1 to 15", () => {
            renderDialog();
            expect(slider("Minimum overlap").step).toBe("0.5");
            expect(slider("Minimum group size").min).toBe("1");
            expect(slider("Minimum group size").max).toBe("15");
            expect(slider("Maximum group size").min).toBe("1");
            expect(slider("Maximum group size").max).toBe("15");
        });

        it("keeps the minimum from passing the maximum", () => {
            renderDialog();
            setSlider("Minimum group size", 14);
            expect(slider("Minimum group size").value).toBe("10");
            expect(slider("Maximum group size").value).toBe("10");
            setSlider("Maximum group size", 3);
            expect(slider("Maximum group size").value).toBe("10");
        });

        it("explains what happens to students who do not fit", () => {
            renderDialog();
            expect(screen.getByText(/goes on the waitlist/i)).toBeTruthy();
        });
    });

    describe("preview", () => {
        it("shows the groups, students, and waitlist the plan would have", () => {
            renderDialog();
            expect(total("Groups")).toBe(2);
            expect(total("Students")).toBe(12);
            expect(total("Waitlisted students")).toBe(0);
        });

        it("puts the charts below the summary numbers and above the sliders", () => {
            renderDialog();
            const after = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
            const waitlisted = screen.getByText("Waitlisted students");
            // the Optimize button's icon is an image too, so keep to the charts
            const charts = screen.getAllByRole("img").filter(image => image.getAttribute("aria-label")!.includes(": Min"));
            expect(after(screen.getByText("Preview"), waitlisted)).toBe(true);
            expect(after(waitlisted, charts[0])).toBe(true);
            expect(after(charts[charts.length - 1], slider("Minimum overlap"))).toBe(true);
            expect(after(slider("Minimum overlap"), slider("Maximum group size"))).toBe(true);
        });

        it("shows the three charts", () => {
            renderDialog();
            const charts = screen.getAllByRole("img").map(chart => chart.getAttribute("aria-label")!);
            expect(charts.some(label => label.startsWith("Group size"))).toBe(true);
            expect(charts.some(label => label.startsWith("Countries per group"))).toBe(true);
            expect(charts.some(label => label.startsWith("Time overlap per group"))).toBe(true);
        });

        it("shows each group as a dot in each chart, and fewer dots when groups are broken up", () => {
            renderDialog();
            // 2 groups, so 2 dots in each of the 3 charts
            expect(document.querySelectorAll("circle")).toHaveLength(6);
            setSlider("Minimum group size", 7);
            // 1 group left
            expect(document.querySelectorAll("circle")).toHaveLength(3);
        });

        it("updates the groups and the waitlist as the minimum group size changes", () => {
            renderDialog();
            expect(total("Groups")).toBe(2);
            // two groups of 6 cannot both have 7, so one is broken up and the rest of its students wait
            setSlider("Minimum group size", 7);
            expect(total("Groups")).toBe(1);
            expect(total("Waitlisted students")).toBe(2);
            expect(total("Students")).toBe(12);
            // and back again
            setSlider("Minimum group size", 1);
            expect(total("Groups")).toBe(2);
            expect(total("Waitlisted students")).toBe(0);
        });

        it("updates the groups as the largest group size changes", () => {
            renderDialog();
            expect(total("Groups")).toBe(2);
            // twelve students in groups of at most 4 take three groups
            setSlider("Maximum group size", 4);
            expect(total("Groups")).toBe(3);
            expect(total("Students")).toBe(12);
            expect(total("Waitlisted students")).toBe(0);
            // or one group of 12
            setSlider("Maximum group size", 12);
            expect(total("Groups")).toBe(1);
            // and back again
            setSlider("Maximum group size", 10);
            expect(total("Groups")).toBe(2);
        });

        it("waitlists students who do not fit when the largest group is small and the minimum is high", () => {
            renderDialog();
            setSlider("Maximum group size", 5);
            setSlider("Minimum group size", 5);
            // three groups of 4 cannot reach 5, so they are broken up, and two groups of 5 are formed from what is left
            expect(total("Students")).toBe(12);
            expect(total("Waitlisted students")).toBe(2);
        });

        it("updates the group size chart as the groups change", () => {
            renderDialog();
            const sizeChart = () => screen.getAllByRole("img").map(c => c.getAttribute("aria-label")!).find(l => l.startsWith("Group size"))!;
            expect(sizeChart()).toBe("Group size: Min 6 students, Max 6 students");
            setSlider("Minimum group size", 7);
            expect(sizeChart()).toBe("Group size: Min 10 students, Max 10 students");
        });

        it("waitlists students who cannot give the minimum overlap", () => {
            // eleven free all weekend, one free only Friday 8 to 9
            const students = [...Array.from({ length: 11 }, (_, i) => student(`a${String(i).padStart(2, "0")}`, WHOLE_WEEKEND())), student("z", [window(0, "08", "09")])];
            renderDialog(cohortOf(students));
            expect(total("Waitlisted students")).toBe(0);
            setSlider("Minimum overlap", 2);
            expect(total("Waitlisted students")).toBe(1);
        });

        it("shows the overlap chart in hours of real shared time", () => {
            const students = [student("a", [window(0, "08", "12")]), student("b", [window(0, "08", "12")])];
            renderDialog(cohortOf(students));
            const overlapChart = screen.getAllByRole("img").map(c => c.getAttribute("aria-label")!).find(l => l.startsWith("Time overlap per group"))!;
            expect(overlapChart).toBe("Time overlap per group: Min 4 hours, Max 4 hours");
        });

        it("says so when the cohort has no students, and shows an empty plan", () => {
            renderDialog(cohortOf([]));
            expect(screen.getByText(/no students yet/i)).toBeTruthy();
            expect(total("Groups")).toBe(0);
            expect(total("Students")).toBe(0);
        });

        it("leaves the cohort's students as they were", () => {
            const cohort = cohortOf(twelveFree());
            const before = JSON.stringify(cohort);
            renderDialog(cohort);
            setSlider("Minimum group size", 7);
            setSlider("Minimum overlap", 3);
            expect(JSON.stringify(cohort)).toBe(before);
        });
    });

    describe("creating the plan", () => {
        it("does nothing until Create plan is pressed", () => {
            renderDialog();
            setSlider("Minimum group size", 7);
            expect(createPlan).not.toHaveBeenCalled();
            expect(navigate).not.toHaveBeenCalled();
        });

        it("creates the plan with the name and settings, then goes to it", async () => {
            const cohort = cohortOf(twelveFree());
            const { onClose } = renderDialog(cohort);
            fireEvent.change(screen.getByLabelText("Plan name"), { target: { value: "Spring Groups" } });
            setSlider("Minimum overlap", 1.5);
            setSlider("Minimum group size", 4);
            setSlider("Maximum group size", 8);
            fireEvent.click(createButton());

            await waitFor(() => expect(navigate).toHaveBeenCalledWith("/plan/new-plan"));
            expect(createPlan).toHaveBeenCalledWith(cohort, { name: "Spring Groups", minOverlapHours: 1.5, minGroupSize: 4, maxGroupSize: 8 });
            expect(onClose).toHaveBeenCalled();
            expect(notifications.success).toHaveBeenCalledWith("Plan My Plan created.");
        });

        it("creates the plan with the default settings when nothing was changed", async () => {
            const cohort = cohortOf(twelveFree());
            renderDialog(cohort);
            fireEvent.click(createButton());
            await waitFor(() => expect(createPlan).toHaveBeenCalledWith(cohort, { name: "Plan 1", minOverlapHours: 0, minGroupSize: 1, maxGroupSize: 10 }));
        });

        it("trims spaces around the name", async () => {
            renderDialog();
            fireEvent.change(screen.getByLabelText("Plan name"), { target: { value: "  Fall Plan  " } });
            fireEvent.click(createButton());
            await waitFor(() => expect(createPlan).toHaveBeenCalled());
            expect(createPlan.mock.calls[0][1].name).toBe("Fall Plan");
        });

        it("cannot create a plan without a name", () => {
            renderDialog();
            fireEvent.change(screen.getByLabelText("Plan name"), { target: { value: "" } });
            expect(createButton().disabled).toBe(true);
            fireEvent.change(screen.getByLabelText("Plan name"), { target: { value: "   " } });
            expect(createButton().disabled).toBe(true);
            fireEvent.change(screen.getByLabelText("Plan name"), { target: { value: "Fall" } });
            expect(createButton().disabled).toBe(false);
            fireEvent.click(createButton());
        });

        it("cannot be pressed twice while the plan is being made", async () => {
            let finish: (plan: unknown) => void = () => { };
            createPlan.mockReturnValue(new Promise(resolve => { finish = resolve; }));
            renderDialog();
            fireEvent.click(createButton());
            await waitFor(() => expect(createButton().textContent).toBe("Creating..."));
            expect(createButton().disabled).toBe(true);
            expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(true);
            expect((screen.getByLabelText("Plan name") as HTMLInputElement).disabled).toBe(true);
            fireEvent.click(createButton());
            expect(createPlan).toHaveBeenCalledTimes(1);
            finish({ id: "p", name: "Done" });
            await waitFor(() => expect(navigate).toHaveBeenCalledWith("/plan/p"));
        });

        it("reports a failure and stays open, ready to try again", async () => {
            createPlan.mockRejectedValue(new Error("offline"));
            const { onClose } = renderDialog();
            fireEvent.click(createButton());
            await waitFor(() => expect(notifications.error).toHaveBeenCalledWith("Could not create plan. offline"));
            expect(navigate).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
            await waitFor(() => expect(createButton().disabled).toBe(false));
            expect(createButton().textContent).toBe("Create plan");
        });

        it("closes without creating anything on Cancel", () => {
            const { onClose } = renderDialog();
            setSlider("Minimum group size", 5);
            fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
            expect(onClose).toHaveBeenCalled();
            expect(createPlan).not.toHaveBeenCalled();
            expect(navigate).not.toHaveBeenCalled();
        });
    });

    describe("optimizing", () => {
        const sixAtMost = () => setSlider("Maximum group size", 6);

        afterEach(() => { vi.restoreAllMocks(); });

        it("has an Optimize button next to the sliders, below the charts", () => {
            renderDialog();
            const after = (a: Element, b: Element) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
            expect(optimizeButton().disabled).toBe(false);
            // the Optimize button's icon is an image too, so keep to the charts
            const charts = screen.getAllByRole("img").filter(image => image.getAttribute("aria-label")!.includes(": Min"));
            expect(after(charts[charts.length - 1], optimizeButton())).toBe(true);
            expect(after(slider("Maximum group size"), optimizeButton())).toBe(true);
        });

        it("is off when the cohort has no students", () => {
            renderDialog(cohortOf([]));
            expect(optimizeButton().disabled).toBe(true);
        });

        it("shows \"Comparing groupings\" with a progress bar that fills as the 50 groupings are compared", async () => {
            renderDialog(cohortOf(mixedStudents()));
            sixAtMost();
            fireEvent.click(optimizeButton());

            const bar = await screen.findByRole("progressbar", { name: "Comparing groupings" });
            expect(screen.getByText("Comparing groupings", { selector: "h6" })).toBeTruthy();
            expect(screen.getByText(/^\d+ of 50$/)).toBeTruthy();

            // it fills up, and is partway at some point
            const seen: number[] = [];
            await waitFor(() => {
                seen.push(Number(bar.getAttribute("aria-valuenow")));
                expect(screen.queryByRole("progressbar")).toBeNull();
            }, FINISHED);
            expect(seen.some(value => value > 0 && value < 100)).toBe(true);
            expect(seen.every((value, i) => i === 0 || value >= seen[i - 1])).toBe(true);
            expect(screen.queryByText("Comparing groupings")).toBeNull();
            expect(optimizeButton().disabled).toBe(false);
        });

        it("turns off the settings, Create plan, and Cancel while it compares", async () => {
            renderDialog(cohortOf(mixedStudents()));
            fireEvent.click(optimizeButton());
            await screen.findByRole("progressbar");
            expect(slider("Minimum overlap").disabled).toBe(true);
            expect(slider("Minimum group size").disabled).toBe(true);
            expect(slider("Maximum group size").disabled).toBe(true);
            expect((screen.getByLabelText("Plan name") as HTMLInputElement).disabled).toBe(true);
            expect(createButton().disabled).toBe(true);
            expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(true);
            await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull(), FINISHED);
            expect(createButton().disabled).toBe(false);
            expect(slider("Maximum group size").disabled).toBe(false);
        });

        it("keeps the grouping that waitlists the fewest students, and says what it did", async () => {
            // the first seed tried is 1, which beats the fixed order for these students
            vi.spyOn(Math, "random").mockReturnValue(1.5 / 1_000_000_000);
            renderDialog(cohortOf(mixedStudents()));
            sixAtMost();
            const before = waitlistTotal();
            expect(before).toBeGreaterThan(0);
            fireEvent.click(optimizeButton());

            await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull(), FINISHED);
            const after = waitlistTotal();
            expect(after).toBeLessThan(before);
            expect(screen.getByText(new RegExp(`Found a grouping that waitlists fewer students: from ${before} to ${after}\\.`))).toBeTruthy();
            // everyone is still counted, and the charts have as many dots as groups
            expect(total("Students")).toBe(30);
            expect(document.querySelectorAll("circle")).toHaveLength(3 * total("Groups"));
        });

        it("says so when no other grouping is better, and leaves the numbers as they were", async () => {
            // twelve students free all weekend: nobody is waitlisted to begin with
            renderDialog();
            fireEvent.click(optimizeButton());
            await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull(), FINISHED);
            expect(screen.getByText(/No other grouping waitlisted fewer students than 0\./)).toBeTruthy();
            expect(total("Groups")).toBe(2);
            expect(waitlistTotal()).toBe(0);
        });

        it("never makes the waitlist worse when it is pressed again", async () => {
            renderDialog(cohortOf(mixedStudents()));
            sixAtMost();
            const results: number[] = [waitlistTotal()];
            for (let i = 0; i < 2; i++) {
                fireEvent.click(optimizeButton());
                await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull(), FINISHED);
                results.push(waitlistTotal());
            }
            expect(results[1]).toBeLessThanOrEqual(results[0]);
            expect(results[2]).toBeLessThanOrEqual(results[1]);
        });

        it("creates the plan with the arrangement that the preview shows", async () => {
            vi.spyOn(Math, "random").mockReturnValue(1.5 / 1_000_000_000);
            const students = mixedStudents();
            const cohort = cohortOf(students);
            renderDialog(cohort);
            sixAtMost();
            fireEvent.click(optimizeButton());
            await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull(), FINISHED);
            const previewed = waitlistTotal();

            fireEvent.click(createButton());
            await waitFor(() => expect(createPlan).toHaveBeenCalled());
            const options = createPlan.mock.calls[0][1];
            expect(options).toMatchObject({ minOverlapHours: 0, minGroupSize: 1, maxGroupSize: 6 });
            expect(typeof options.shuffleSeed).toBe("number");

            // the plan the service builds from these options has the waitlist the preview showed
            const placements = students.map(s => ({ plan_id: "p", student_id: s.id, anchor: false, priority: 0, student: s }) as Placement);
            const built = generatePlan(placements, { maxGroupSize: options.maxGroupSize, minOverlapHours: options.minOverlapHours, minGroupSize: options.minGroupSize, shuffleSeed: options.shuffleSeed });
            expect(built.placements.filter(p => !p.group_id)).toHaveLength(previewed);
        });

        it("creates the plan in the fixed order when Optimize was not used", async () => {
            renderDialog();
            fireEvent.click(createButton());
            await waitFor(() => expect(createPlan).toHaveBeenCalled());
            expect(createPlan.mock.calls[0][1].shuffleSeed).toBeUndefined();
        });

        it("drops the optimized arrangement and its message when a setting changes", async () => {
            vi.spyOn(Math, "random").mockReturnValue(1.5 / 1_000_000_000);
            renderDialog(cohortOf(mixedStudents()));
            sixAtMost();
            const fixedWaitlist = waitlistTotal();
            fireEvent.click(optimizeButton());
            await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull(), FINISHED);
            expect(waitlistTotal()).toBeLessThan(fixedWaitlist);

            // back to the fixed order, so the same settings give the fixed order's waitlist again
            setSlider("Minimum overlap", 0.5);
            setSlider("Minimum overlap", 0);
            expect(waitlistTotal()).toBe(fixedWaitlist);
            expect(screen.queryByText(/Found a grouping/)).toBeNull();
            expect(screen.queryByText(/No other grouping/)).toBeNull();

            fireEvent.click(createButton());
            await waitFor(() => expect(createPlan).toHaveBeenCalled());
            expect(createPlan.mock.calls[0][1].shuffleSeed).toBeUndefined();
        });

        it("starts again from the fixed order when the window is opened again", async () => {
            vi.spyOn(Math, "random").mockReturnValue(1.5 / 1_000_000_000);
            const cohort = cohortOf(mixedStudents());
            const { rerender } = render(<NewPlanDialog cohort={cohort} open onClose={vi.fn()} />);
            sixAtMost();
            fireEvent.click(optimizeButton());
            await waitFor(() => expect(screen.queryByRole("progressbar")).toBeNull(), FINISHED);
            expect(screen.getByText(/Found a grouping/)).toBeTruthy();

            rerender(<NewPlanDialog cohort={cohort} open={false} onClose={vi.fn()} />);
            await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), FINISHED);
            rerender(<NewPlanDialog cohort={cohort} open onClose={vi.fn()} />);
            expect(screen.queryByText(/Found a grouping/)).toBeNull();
            expect(slider("Maximum group size").value).toBe("10");
            fireEvent.click(createButton());
            await waitFor(() => expect(createPlan).toHaveBeenCalled());
            expect(createPlan.mock.calls[0][1].shuffleSeed).toBeUndefined();
        });
    });
});
