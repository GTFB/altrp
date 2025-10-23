import { describe, it, expect } from 'bun:test';
import { sha256, sha256Base64, genId, matchesModel } from '../src/utils';

describe('Utils', () => {
	describe('sha256', () => {
		it('should hash string correctly', async () => {
			const hash = await sha256('test');
			expect(hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
		});
	});

	describe('sha256Base64', () => {
		it('should hash string to base64 correctly', async () => {
			const hash = await sha256Base64('test');
			expect(hash).toBe('n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=');
		});
	});

	describe('genId', () => {
		it('should generate ID with default prefix', () => {
			const id = genId();
			expect(id).toMatch(/^req_[a-z0-9]{8}$/);
		});

		it('should generate ID with custom prefix', () => {
			const id = genId('test');
			expect(id).toMatch(/^test_[a-z0-9]{8}$/);
		});
	});

	describe('matchesModel', () => {
		it('should match exact model', () => {
			expect(matchesModel('gemini-1.5-flash', 'gemini-1.5-flash')).toBe(true);
		});

		it('should match wildcard pattern', () => {
			expect(matchesModel('gemini-*', 'gemini-1.5-flash')).toBe(true);
			expect(matchesModel('gpt-*', 'gpt-3.5-turbo')).toBe(true);
		});

		it('should not match different models', () => {
			expect(matchesModel('gemini-*', 'gpt-3.5-turbo')).toBe(false);
		});
	});
});
