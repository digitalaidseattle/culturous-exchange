import { describe, expect, it } from "vitest";
import { AgeValidator, CityValidator, CountryValidator, TimeWindowValidator } from "./spreadsheetValidationService";
import { Student, TimeWindow } from "./types";

describe("SpeadsheetValidationService", () => {

    it("validate age", () => {
        const validator = new AgeValidator();

        const student = {
            age: null
        } as Student;
        let response = validator.validate(student);
        expect(response.length).toBe(1);
        expect(response[0].isValid).toBe(false);

        student.age = 12;
        response = validator.validate(student);
        expect(response.length).toBe(1);
        expect(response[0].isValid).toBe(false);
        expect(response[0].message).toBe('Age must between 13 and 19.');

        student.age = 20;
        response = validator.validate(student);
        expect(response.length).toBe(1);
        expect(response[0].isValid).toBe(false);
        expect(response[0].message).toBe('Age must between 13 and 19.');

        student.age = 13;
        response = validator.validate(student);
        expect(response.length).toBe(0);

    });

    it("validate country", () => {
        const validator = new CountryValidator();

        const student = {
            country: ""
        } as Student;

        let response = validator.validate(student);
        expect(response.length).toBe(1);
        expect(response[0].isValid).toBe(false);
        expect(response[0].message).toBe('Country is required');

        student.country = "Peru";
        response = validator.validate(student);
        expect(response.length).toBe(0);

    });

    it("validate country", () => {
        const validator = new CountryValidator();

        const student = {
            country: ""
        } as Student;

        let response = validator.validate(student);
        expect(response.length).toBe(1);
        expect(response[0].isValid).toBe(false);
        expect(response[0].message).toBe('Country is required');

        student.country = "Peru";
        response = validator.validate(student);
        expect(response.length).toBe(0);

    });

    it("validate city", () => {
        const validator = new CityValidator();

        const student = {
            city: ""
        } as Student;

        let response = validator.validate(student);
        expect(response.length).toBe(1);
        expect(response[0].isValid).toBe(false);
        expect(response[0].message).toBe('City is required');

        student.city = "Aiea";
        response = validator.validate(student);
        expect(response.length).toBe(0);

    });

    it("validate timewindows", () => {
        const validator = new TimeWindowValidator();

        const student = {
            timeWindows: [] as TimeWindow[]
        } as Student;

        let response = validator.validate(student);
        expect(response.length).toBe(1);
        expect(response[0].message).toBe('A time window is required.');

        student.timeWindows = [{ day_in_week: "Friday", start_t: "07:00:00", end_t: "12:00:00" } as TimeWindow];
        response = validator.validate(student);
        expect(response.length).toBe(0);
    });


});