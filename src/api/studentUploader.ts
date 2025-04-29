/**
 * Uploader.ts
 *
 * encapsulate excel interaction
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { read, utils } from "xlsx";
import { timeWindowService } from "./ceTimeWindowService";
import { FailedStudent, Student } from "./types";
import { studentService } from "./ceStudentService";
import { SpeadsheetValidationService } from "./spreadsheetValidationService";


class StudentUploader {
    private validationService = new SpeadsheetValidationService();

    changeToLowercase(object: any): any {
        const lowered: { [key: string]: any } = {};
        Object.keys(object).forEach(key => {
            lowered[key.toLowerCase().trim()] = object[key];
        })

        return lowered;
    }

    createStudent(dict: any): Student {
        const times = dict['please mark all times that would be possible for the online group session on the weekend (based in your time zone)'];
        return {
            name: dict['first/given name in english'].trim() + ' ' + dict['last/sur/family name in english'].trim(),
            age: Number.parseInt(dict['your age (how old are you currently)']),
            email: dict['email address'],
            city: dict['home city (and state if applicable)'],
            country: dict['home country:'].trim(),
            gender: dict['gender'].trim(),
            timeWindows: timeWindowService.mapTimeWindows(times.split(','))
        } as Student
    }

    async get_students_from_excel(excel_file: File): Promise<Student[]> {
        try {
            const arrayBuffer = await excel_file.arrayBuffer();
            const workbook = read(arrayBuffer);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data: any[] = utils.sheet_to_json(worksheet);

            // Modify data if necessary (e.g., ensure id is generated if not provided)
            return data
                .map(dict => this.changeToLowercase(dict))
                .map((dict) => this.createStudent(dict));
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            throw new Error('Failed to parse Excel file');
        }
    }

    async insertStudent(student: Student): Promise<{ success: boolean; student: Student | FailedStudent }> {
        const errors = this.validationService.validateStudent(student);
        if (errors && Object.keys(errors).length > 0) {
            console.error(`Spreadsheet validation failed for student ${student}: `, errors)
            //FIX ME: failedError: errors is not recievable as an array on the front end notification system. The front-end is currently set up to display a single error string for each failed student.
            return { success: false, student: { ...student, failedError: errors } };
        }
        return timeWindowService
            .getTimeZone(student.city!, student.country)
            .then(tzData => {
                student.time_zone = tzData.timezone;
                timeWindowService.adjustTimeWindows(student, tzData.offset);
                return studentService.insert(student)
                    .then(inserted => {
                        return { success: true, student: inserted };
                    })
                    .catch((err) => {
                        console.error(`Student ${student.name} could not be inserted`);
                        return { success: false, student: { ...student, failedError: err.message } };
                    });
            })
            .catch((err) => {
                return { success: false, student: { ...student, failedError: err.message } };
            })
    }

    async insert_from_excel(excel_file: File): Promise<{ successCount: number; failedStudents: FailedStudent[] }> {
        try {
            return this.get_students_from_excel(excel_file)
                .then(async students => {
                    return Promise
                        .all(students.map(student => this.insertStudent(student)))
                        .then((resps) => {
                            const successful = resps.filter(resp => resp.success);
                            const failed = resps.filter(resp => !resp.success);
                            return {
                                successCount: successful.length,
                                failedStudents: failed.map(resp => resp.student as FailedStudent)
                            }
                        })
                })
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error processing Excel file:', error.message);
            } else {
                console.error('Error processing Excel file:', error);
            }
            throw new Error('Failed to insert students from Excel file');
        }
    }

}

const studentUploader = new StudentUploader();
export { studentUploader };
