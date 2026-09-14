import { describe, it, expect } from 'vitest';
import {
  validateSubmission,
  isFormType,
  FORM_TYPES,
} from '../../src/utils/forms/schema';

describe('isFormType', () => {
  it('accepts known form types', () => {
    for (const type of FORM_TYPES) {
      expect(isFormType(type)).toBe(true);
    }
  });

  it('rejects unknown values', () => {
    expect(isFormType('unknown')).toBe(false);
    expect(isFormType(undefined)).toBe(false);
    expect(isFormType(123)).toBe(false);
    expect(isFormType(null)).toBe(false);
  });
});

describe('validateSubmission', () => {
  describe('unknown form type', () => {
    it('fails with a formType field error', () => {
      const result = validateSubmission('bogus', {});
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.fieldErrors.formType).toBeTruthy();
      }
    });
  });

  describe('contact', () => {
    it('accepts a valid submission', () => {
      const result = validateSubmission('contact', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'Hello, this is a test message.',
      });
      expect(result).toEqual({
        ok: true,
        data: {
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          message: 'Hello, this is a test message.',
        },
      });
    });

    it('trims whitespace', () => {
      const result = validateSubmission('contact', {
        name: '  Ada  ',
        email: '  ada@example.com  ',
        message: '  Hello, this is a test message.  ',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.name).toBe('Ada');
        expect(result.data.email).toBe('ada@example.com');
      }
    });

    it('requires name, email, and message', () => {
      const result = validateSubmission('contact', {});
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.fieldErrors.name).toBeTruthy();
        expect(result.fieldErrors.email).toBeTruthy();
        expect(result.fieldErrors.message).toBeTruthy();
      }
    });

    it('rejects a name shorter than 2 characters', () => {
      const result = validateSubmission('contact', {
        name: 'A',
        email: 'a@example.com',
        message: 'A valid message here.',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.name).toBeTruthy();
    });

    it('rejects an invalid email', () => {
      const result = validateSubmission('contact', {
        name: 'Ada',
        email: 'not-an-email',
        message: 'A valid message here.',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.email).toBeTruthy();
    });

    it('rejects a message shorter than 10 characters', () => {
      const result = validateSubmission('contact', {
        name: 'Ada',
        email: 'ada@example.com',
        message: 'short',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.message).toBeTruthy();
    });

    it('rejects fields over the max length', () => {
      const result = validateSubmission('contact', {
        name: 'Ada',
        email: 'ada@example.com',
        message: 'x'.repeat(5001),
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.message).toBeTruthy();
    });

    it('drops unknown fields (e.g. honeypot, formType) silently', () => {
      const result = validateSubmission('contact', {
        name: 'Ada',
        email: 'ada@example.com',
        message: 'A valid message here.',
        website: 'http://spam.example',
        formType: 'contact',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({
          name: 'Ada',
          email: 'ada@example.com',
          message: 'A valid message here.',
        });
      }
    });
  });

  describe('lead', () => {
    it('accepts required fields with optional fields omitted', () => {
      const result = validateSubmission('lead', {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      });
      expect(result).toEqual({
        ok: true,
        data: { name: 'Ada Lovelace', email: 'ada@example.com' },
      });
    });

    it('validates phone only when provided', () => {
      const valid = validateSubmission('lead', {
        name: 'Ada',
        email: 'ada@example.com',
        phone: '+1 (555) 123-4567',
      });
      expect(valid.ok).toBe(true);

      const invalid = validateSubmission('lead', {
        name: 'Ada',
        email: 'ada@example.com',
        phone: '123',
      });
      expect(invalid.ok).toBe(false);
      if (!invalid.ok) expect(invalid.fieldErrors.phone).toBeTruthy();
    });

    it('accepts an optional company field', () => {
      const result = validateSubmission('lead', {
        name: 'Ada',
        email: 'ada@example.com',
        company: 'Analytical Engines Inc.',
      });
      expect(result.ok).toBe(true);
      if (result.ok)
        expect(result.data.company).toBe('Analytical Engines Inc.');
    });
  });

  describe('newsletter', () => {
    it('accepts a valid email', () => {
      const result = validateSubmission('newsletter', {
        email: 'ada@example.com',
      });
      expect(result).toEqual({ ok: true, data: { email: 'ada@example.com' } });
    });

    it('requires email', () => {
      const result = validateSubmission('newsletter', {});
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.email).toBeTruthy();
    });
  });
});
