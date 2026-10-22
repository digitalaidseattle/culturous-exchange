/**
 * ProfileUploader.test.ts
 *
 * Tests for the spreadsheet-level checks in validate_excel.
 *
 * @copyright 2026 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from 'vitest';
import { utils, write } from 'xlsx';

import { CEProfile } from '../../api/types';
import { UI_STRINGS } from '../../constants';
import { ProfileUploader } from './ProfileUploader';

vi.mock('../time/ceTimeWindowService', () => ({
    CETimeWindowService: { getInstance: () => ({}) }
}));

class TestUploader extends ProfileUploader<CEProfile> {
    requiredColumns = ['name', 'email address'];
    constructor() {
        super({} as any, {} as any);
    }
    createProfile(dict: any): CEProfile {
        return dict as CEProfile;
    }
}

// jsdom's File has no arrayBuffer(), so stand in with just what the uploader reads
function fakeFile(buffer: ArrayBuffer, name: string): File {
    return { name, arrayBuffer: async () => buffer } as unknown as File;
}

function excelFile(rows: any[][], name = 'students.xlsx'): File {
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), 'Sheet1');
    return fakeFile(write(workbook, { type: 'array', bookType: 'xlsx' }), name);
}

describe('ProfileUploader.validate_excel', () => {
    const uploader = new TestUploader();

    it('accepts a sheet with every required column and a data row', async () => {
        const file = excelFile([['Name', 'Email Address', 'Extra'], ['Ana Lima', 'ana@example.com', 'x']]);
        expect(await uploader.validate_excel(file)).toEqual([]);
    });

    it('matches headers ignoring case and surrounding spaces', async () => {
        const file = excelFile([['  NAME ', 'email ADDRESS'], ['Ana Lima', 'ana@example.com']]);
        expect(await uploader.validate_excel(file)).toEqual([]);
    });

    it('reports missing columns', async () => {
        const file = excelFile([['Name'], ['Ana Lima']]);
        expect(await uploader.validate_excel(file))
            .toEqual([`${UI_STRINGS.SPREADSHEET_MISSING_COLUMNS} email address`]);
    });

    it('reports a sheet with headers but no data rows', async () => {
        const file = excelFile([['Name', 'Email Address']]);
        expect(await uploader.validate_excel(file)).toEqual([UI_STRINGS.SPREADSHEET_EMPTY]);
    });

    it('reports an empty sheet', async () => {
        const file = excelFile([]);
        expect(await uploader.validate_excel(file)).toEqual([UI_STRINGS.SPREADSHEET_EMPTY]);
    });

    it('rejects a file that is not a spreadsheet', async () => {
        // xlsx reads arbitrary bytes as a one-cell text sheet, so this surfaces as missing columns
        const file = fakeFile(new Uint8Array([0, 159, 146, 150, 255]).buffer, 'photo.xlsx');
        expect((await uploader.validate_excel(file)).length).toBeGreaterThan(0);
    });

    it('insert_from_excel refuses an invalid file before reading any rows', async () => {
        const file = excelFile([['Name'], ['Ana Lima']], 'bad.xlsx');
        await expect(uploader.insert_from_excel(file)).rejects.toThrow('bad.xlsx: Missing columns: email address');
    });
});
