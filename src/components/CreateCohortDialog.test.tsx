/**
 *  CreateCohortDialog.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notifications = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warn: vi.fn() }));
const navigate = vi.hoisted(() => vi.fn());
const createPlan = vi.hoisted(() => vi.fn());
const createCohort = vi.hoisted(() => vi.fn());
const uploadStudents = vi.hoisted(() => vi.fn());
const getById = vi.hoisted(() => vi.fn());
const nameExists = vi.hoisted(() => vi.fn());

// the notification helper comes from the shared library, and the rest write to the database; stand in for them
vi.mock("@digitalaidseattle/core", async () => {
    const React = await import("react");
    return {
        RefreshContext: React.createContext({ refresh: 0, setRefresh: vi.fn() }),
        useNotifications: () => notifications
    };
});
vi.mock("react-router", () => ({ useNavigate: () => navigate }));
vi.mock("../services/cohort/ceCohortService", () => ({
    CECohortService: { getInstance: () => ({ createPlan, nameExists }) }
}));
vi.mock("../services/cohort/createCohort", () => ({ createCohort }));
vi.mock("../services/student/uploadStudents", () => ({ uploadStudents }));
vi.mock("../api/ceCohortDao", () => ({ CECohortDao: { getInstance: () => ({ getById }) } }));

import { Cohort, FailedProfile, Student } from "../api/types";
import { CreateCohortDialog } from "./CreateCohortDialog";

const SHEET = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const spreadsheet = (name = "students.xlsx") => new File(["rows"], name, { type: SHEET });
const student = (id: string) => ({ id, name: id, country: "Country", timeWindows: [], anchor: false }) as unknown as Student;
const failed = (name: string) => ({ name, failedError: "Failed to fetch timezone" }) as unknown as FailedProfile;
const NEW_COHORT = { id: "new-cohort", name: "Winter 2027", plans: [], enrollments: [] } as unknown as Cohort;

const renderDialog = (props: Partial<React.ComponentProps<typeof CreateCohortDialog>> = {}) => {
    const onClose = vi.fn();
    const onCohortCreated = vi.fn();
    render(<CreateCohortDialog open onClose={onClose} onCohortCreated={onCohortCreated} {...props} />);
    return { onClose, onCohortCreated };
};

const nameField = () => screen.getByLabelText("Cohort name") as HTMLInputElement;
const nextButton = () => screen.getByRole("button", { name: /^(arrow-right )?next|creating cohort/i }) as HTMLButtonElement;
const typeName = (value: string) => fireEvent.change(nameField(), { target: { value } });
const chooseFile = async (file: File) => {
    fireEvent.change(screen.getByLabelText("Students file", { selector: "input" }), { target: { files: [file] } });
    await screen.findByText(file.name);
};
const onPlanStep = () => screen.findByText("Create New Plan", { selector: "h2" });

describe("CreateCohortDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createCohort.mockResolvedValue(NEW_COHORT);
        getById.mockResolvedValue(NEW_COHORT);
        uploadStudents.mockResolvedValue({ students: [student("s1"), student("s2")], failedProfiles: [] });
        createPlan.mockResolvedValue({ id: "new-plan", name: "Plan 1" });
        nameExists.mockResolvedValue(false);
    });

    describe("the first step", () => {
        it("asks for the cohort's name and the students' file, with Next and Cancel", () => {
            renderDialog();
            expect(screen.getByText("Create Cohort", { selector: "h2" })).toBeTruthy();
            expect(nameField()).toBeTruthy();
            expect(screen.getByText("Students file", { selector: "h6" })).toBeTruthy();
            expect(screen.getByText(/drag the student spreadsheet here, or click to select it/i)).toBeTruthy();
            expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
            expect(nextButton().textContent).toBe("Next");
        });

        it("keeps the cursor in the name field", () => {
            renderDialog();
            expect(document.activeElement).toBe(nameField());
        });

        it("cannot go on until the cohort has a name", () => {
            renderDialog();
            expect(nextButton().disabled).toBe(true);
            typeName("   ");
            expect(nextButton().disabled).toBe(true);
            typeName("Winter 2027");
            expect(nextButton().disabled).toBe(false);
        });

        it("shows the chosen file's name, and takes it out again", async () => {
            renderDialog();
            await chooseFile(spreadsheet("winter.xlsx"));
            fireEvent.click(screen.getByRole("button", { name: "Remove file" }));
            expect(screen.queryByText("winter.xlsx")).toBeNull();
            expect(screen.getByText(/drag the student spreadsheet here/i)).toBeTruthy();
        });

        it("does not take a file that is not a spreadsheet", async () => {
            renderDialog();
            fireEvent.change(screen.getByLabelText("Students file", { selector: "input" }), {
                target: { files: [new File(["x"], "notes.txt", { type: "text/plain" })] }
            });
            expect((await screen.findByRole("alert")).textContent).toMatch(/not an excel spreadsheet/i);
            expect(screen.queryByText("notes.txt")).toBeNull();
        });

        it("stays on the first step, and uploads nothing, when another cohort has the name", async () => {
            nameExists.mockResolvedValue(true);
            renderDialog();
            typeName("Winter 2027");
            await chooseFile(spreadsheet());
            fireEvent.click(nextButton());
            expect(await screen.findByText("A cohort with this name already exists.")).toBeTruthy();
            expect(uploadStudents).not.toHaveBeenCalled();
            expect(createCohort).not.toHaveBeenCalled();
            expect(nameField().getAttribute("aria-invalid")).toBe("true");
            // typing a new name clears the message
            typeName("Winter 2028");
            expect(screen.queryByText("A cohort with this name already exists.")).toBeNull();
        });

        it("says so, and makes nothing, when it cannot check whether the name is taken", async () => {
            nameExists.mockRejectedValue(new Error("offline"));
            renderDialog();
            typeName("Winter 2027");
            fireEvent.click(nextButton());
            expect(await screen.findByText("Unable to validate cohort name.")).toBeTruthy();
            expect(createCohort).not.toHaveBeenCalled();
        });

        it("Cancel closes the window and makes nothing", () => {
            const { onClose } = renderDialog();
            typeName("Winter 2027");
            fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(createCohort).not.toHaveBeenCalled();
            expect(uploadStudents).not.toHaveBeenCalled();
        });
    });

    describe("Next", () => {
        it("adds the file's students, creates the cohort with them, and goes to the plan step", async () => {
            const { onCohortCreated } = renderDialog();
            const file = spreadsheet();
            typeName("  Winter 2027  ");
            await chooseFile(file);
            fireEvent.click(nextButton());

            await onPlanStep();
            expect(uploadStudents).toHaveBeenCalledWith([file]);
            expect(createCohort).toHaveBeenCalledWith({ name: "Winter 2027", students: [student("s1"), student("s2")] });
            expect(onCohortCreated).toHaveBeenCalledTimes(1);
            expect(notifications.success).toHaveBeenCalledWith("Cohort Winter 2027 created.");
        });

        it("without a file, creates the cohort from the students who are not in a cohort yet", async () => {
            renderDialog();
            typeName("Winter 2027");
            fireEvent.click(nextButton());

            await onPlanStep();
            expect(uploadStudents).not.toHaveBeenCalled();
            expect(createCohort).toHaveBeenCalledWith({ name: "Winter 2027", students: undefined });
        });

        it("goes on when Enter is pressed in the name field", async () => {
            renderDialog();
            typeName("Winter 2027");
            fireEvent.keyDown(nameField(), { key: "Enter" });
            await onPlanStep();
            expect(createCohort).toHaveBeenCalledTimes(1);
        });

        it("shows that it is working, and cannot be cancelled meanwhile", async () => {
            let finish: (cohort: Cohort) => void = () => { };
            createCohort.mockReturnValue(new Promise<Cohort>(resolve => { finish = resolve; }));
            renderDialog();
            typeName("Winter 2027");
            fireEvent.click(nextButton());

            await waitFor(() => expect(nextButton().textContent).toBe("Creating cohort…"));
            expect(nextButton().disabled).toBe(true);
            expect((screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement).disabled).toBe(true);
            expect(nameField().disabled).toBe(true);
            finish(NEW_COHORT);
            await onPlanStep();
        });

        it("goes on with the students that could be added, and lists the rows that could not", async () => {
            uploadStudents.mockResolvedValue({ students: [student("s1")], failedProfiles: [failed("Emilio L"), failed("Llara G")] });
            renderDialog();
            typeName("Winter 2027");
            await chooseFile(spreadsheet());
            fireEvent.click(nextButton());

            await onPlanStep();
            expect(screen.getByText("Emilio L", { exact: false })).toBeTruthy();
            expect(notifications.warn).toHaveBeenCalledWith("3 attempted, 1 added, 2 failed.");
            expect(createCohort).toHaveBeenCalledWith({ name: "Winter 2027", students: [student("s1")] });
        });

        it("stays on the first step, with no cohort made, when no student could be added", async () => {
            uploadStudents.mockResolvedValue({ students: [], failedProfiles: [failed("Emilio L")] });
            renderDialog();
            typeName("Winter 2027");
            await chooseFile(spreadsheet("bad.xlsx"));
            fireEvent.click(nextButton());

            await waitFor(() => expect(notifications.error).toHaveBeenCalledWith("No students could be added from bad.xlsx."));
            expect(screen.getByText("Emilio L", { exact: false })).toBeTruthy();
            expect(createCohort).not.toHaveBeenCalled();
            expect(screen.queryByText("Create New Plan", { selector: "h2" })).toBeNull();
            // once the list is closed, another file can be chosen and Next pressed again
            fireEvent.click(screen.getByRole("button", { name: "Close" }));
            await waitFor(() => expect(nextButton().disabled).toBe(false));
        });

        it("says so, and stays on the first step, when the cohort cannot be created", async () => {
            createCohort.mockRejectedValue(new Error("database is down"));
            renderDialog();
            typeName("Winter 2027");
            fireEvent.click(nextButton());

            await waitFor(() => expect(notifications.error).toHaveBeenCalledWith("Unable to create new cohort. database is down"));
            expect(screen.queryByText("Create New Plan", { selector: "h2" })).toBeNull();
            expect(nextButton().disabled).toBe(false);
        });

        it("says so, and stays on the first step, when the spreadsheet cannot be read", async () => {
            uploadStudents.mockRejectedValue(new Error("Failed to parse"));
            renderDialog();
            typeName("Winter 2027");
            await chooseFile(spreadsheet());
            fireEvent.click(nextButton());

            await waitFor(() => expect(notifications.error).toHaveBeenCalledWith("Unable to create new cohort. Failed to parse"));
            expect(createCohort).not.toHaveBeenCalled();
        });
    });

    describe("the plan step", () => {
        const goToPlanStep = async () => {
            const handlers = renderDialog();
            typeName("Winter 2027");
            fireEvent.click(nextButton());
            await onPlanStep();
            // the first step slides out and is removed
            await waitFor(() => expect(screen.queryByLabelText("Cohort name")).toBeNull());
            return handlers;
        };

        it("is the Create New Plan window's contents, for the new cohort", async () => {
            await goToPlanStep();
            expect((screen.getByLabelText("Cohort") as HTMLInputElement).value).toBe("Winter 2027");
            expect((screen.getByLabelText("Plan name") as HTMLInputElement).value).toBe("Plan 1");
            expect(screen.getByText("Preview")).toBeTruthy();
            expect(screen.getByRole("slider", { name: "Minimum overlap" })).toBeTruthy();
            expect(screen.getByRole("slider", { name: "Minimum group size" })).toBeTruthy();
            expect(screen.getByRole("slider", { name: "Maximum group size" })).toBeTruthy();
            expect(screen.getByRole("button", { name: /optimize/i })).toBeTruthy();
            expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
            expect(screen.getByRole("button", { name: "Create plan" })).toBeTruthy();
        });

        it("replaces the first step, so there is no second Cancel or Next", async () => {
            await goToPlanStep();
            expect(screen.queryByText("Create Cohort", { selector: "h2" })).toBeNull();
            expect(screen.queryByLabelText("Cohort name")).toBeNull();
            expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
            expect(screen.getAllByRole("button", { name: "Cancel" })).toHaveLength(1);
        });

        it("makes the plan for the new cohort and opens it", async () => {
            const { onClose } = await goToPlanStep();
            fireEvent.click(screen.getByRole("button", { name: "Create plan" }));

            await waitFor(() => expect(navigate).toHaveBeenCalledWith("/plan/new-plan"));
            expect(createPlan).toHaveBeenCalledTimes(1);
            expect(createPlan.mock.calls[0][0]).toBe(NEW_COHORT);
            expect(createPlan.mock.calls[0][1]).toMatchObject({ name: "Plan 1" });
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("Cancel closes the window and keeps the cohort that was made", async () => {
            const { onClose } = await goToPlanStep();
            fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(createPlan).not.toHaveBeenCalled();
            expect(createCohort).toHaveBeenCalledTimes(1);
        });
    });
});
