/**
 * StudentUploader.test.ts
 *
 * Tests for parseLocation. Fixtures are taken from the real
 * Winter Program 2025 sample form responses. If updated sample
 * data shows new city/state formats, extend these cases and
 * adjust parseLocation accordingly.
 *
 * @copyright 2025 Digital Aid Seattle
 *
 */
import { describe, expect, it } from 'vitest';
import { parseLocation } from './StudentUploader';

describe('parseLocation', () => {

    it('returns the city untouched when there is no comma and no state column', () => {
        expect(parseLocation('Kabul')).toEqual({ city: 'Kabul', state: '' });
        expect(parseLocation('Davao City')).toEqual({ city: 'Davao City', state: '' });
    });

    it('splits a single-comma answer into city and state', () => {
        expect(parseLocation('São Paulo, SP')).toEqual({ city: 'São Paulo', state: 'SP' });
        expect(parseLocation('Tanta, Al Gharbia')).toEqual({ city: 'Tanta', state: 'Al Gharbia' });
        expect(parseLocation('Coimbatore, Tamil Nadu')).toEqual({ city: 'Coimbatore', state: 'Tamil Nadu' });
    });

    it('handles a comma without a space', () => {
        expect(parseLocation('Itamaraju,Bahia')).toEqual({ city: 'Itamaraju', state: 'Bahia' });
    });

    it('takes first segment as city and last as state when there are multiple commas', () => {
        expect(parseLocation('São João de Meriti, Baixada Fluminense, Rio de Janeiro'))
            .toEqual({ city: 'São João de Meriti', state: 'Rio de Janeiro' });
    });

    it('prefers the dedicated state column over the comma fallback', () => {
        expect(parseLocation('Portland', 'OR')).toEqual({ city: 'Portland', state: 'OR' });
        expect(parseLocation('Portland, Oregon', 'OR')).toEqual({ city: 'Portland', state: 'OR' });
    });

    it('ignores empty segments from trailing or doubled commas', () => {
        expect(parseLocation('Cairo,')).toEqual({ city: 'Cairo', state: '' });
        expect(parseLocation('Cairo,,')).toEqual({ city: 'Cairo', state: '' });
    });

    it('trims whitespace around city and state', () => {
        expect(parseLocation('  Tanta ,  Al Gharbia  ')).toEqual({ city: 'Tanta', state: 'Al Gharbia' });
        expect(parseLocation('Portland', '  OR  ')).toEqual({ city: 'Portland', state: 'OR' });
    });

    it('returns empty strings for missing input', () => {
        expect(parseLocation(undefined)).toEqual({ city: '', state: '' });
        expect(parseLocation('')).toEqual({ city: '', state: '' });
        expect(parseLocation(undefined, undefined)).toEqual({ city: '', state: '' });
    });

    it('passes placeholder text through unchanged, leaving it to validation', () => {
        expect(parseLocation('NA')).toEqual({ city: 'NA', state: '' });
    });

});
