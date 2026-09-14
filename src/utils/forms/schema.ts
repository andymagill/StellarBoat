/**
 * Shared form validation schema.
 *
 * This module has no Astro, DOM, or Worker-runtime imports — it is used
 * both by the client-side progressive-enhancement script (`client.ts`)
 * and by the Worker form handler (`worker/forms/handler.ts`), so the two
 * environments can never disagree about what a valid submission looks like.
 */

export type FormType = 'contact' | 'lead' | 'newsletter';

export const FORM_TYPES: readonly FormType[] = [
  'contact',
  'lead',
  'newsletter',
];

export function isFormType(value: unknown): value is FormType {
  return (
    typeof value === 'string' &&
    (FORM_TYPES as readonly string[]).includes(value)
  );
}

type FieldKind = 'text' | 'email' | 'tel' | 'textarea';

interface FieldRule {
  kind: FieldKind;
  required: boolean;
  minLength?: number;
  maxLength: number;
}

type FormFields = Record<string, FieldRule>;

/**
 * Field rules per form type. Order here is also the canonical column
 * order used when a Google Sheet tab is created for the form type.
 */
export const FORM_SCHEMAS: Record<FormType, FormFields> = {
  contact: {
    name: { kind: 'text', required: true, minLength: 2, maxLength: 200 },
    email: { kind: 'email', required: true, maxLength: 320 },
    message: {
      kind: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 5000,
    },
  },
  lead: {
    name: { kind: 'text', required: true, minLength: 2, maxLength: 200 },
    email: { kind: 'email', required: true, maxLength: 320 },
    company: { kind: 'text', required: false, maxLength: 200 },
    phone: { kind: 'tel', required: false, maxLength: 30 },
  },
  newsletter: {
    email: { kind: 'email', required: true, maxLength: 320 },
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Digits, spaces, dashes, plus sign, parentheses; at least 7 digits.
const PHONE_ALLOWED_RE = /^[\d\s\-+()]{0,20}$/;

export interface FieldErrors {
  [field: string]: string;
}

export type ValidationResult =
  | { ok: true; data: Record<string, string> }
  | { ok: false; fieldErrors: FieldErrors };

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

function isValidPhone(value: string): boolean {
  return PHONE_ALLOWED_RE.test(value) && value.replace(/\D/g, '').length >= 7;
}

function labelFor(field: string): string {
  return field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Validate a raw submission against the schema for `formType`.
 *
 * Unknown fields are silently dropped rather than rejected — this keeps
 * the honeypot field and any future decorative inputs out of the way
 * without needing to special-case them here.
 */
export function validateSubmission(
  formType: unknown,
  raw: Record<string, unknown>
): ValidationResult {
  if (!isFormType(formType)) {
    return { ok: false, fieldErrors: { formType: 'Unknown form type.' } };
  }

  const schema = FORM_SCHEMAS[formType];
  const fieldErrors: FieldErrors = {};
  const data: Record<string, string> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const rawValue = raw[field];
    const value = typeof rawValue === 'string' ? rawValue.trim() : '';

    if (!value) {
      if (rule.required) {
        fieldErrors[field] = `${labelFor(field)} is required.`;
      }
      continue;
    }

    if (value.length > rule.maxLength) {
      fieldErrors[field] = `${labelFor(field)} is too long.`;
      continue;
    }

    if (rule.minLength && value.length < rule.minLength) {
      fieldErrors[field] =
        `${labelFor(field)} must be at least ${rule.minLength} characters.`;
      continue;
    }

    if (rule.kind === 'email' && !isValidEmail(value)) {
      fieldErrors[field] = 'Please enter a valid email address.';
      continue;
    }

    if (rule.kind === 'tel' && !isValidPhone(value)) {
      fieldErrors[field] = 'Please enter a valid phone number.';
      continue;
    }

    data[field] = value;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, data };
}
