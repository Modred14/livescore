// src/lib/validations.js

/**
 * Server-side input validation helpers.
 *
 * Each validator returns: { valid: boolean, errors: { field: string } }
 * Keeps validation logic out of API route handlers.
 */

// ── Primitive checks ──────────────────────────────────────────────────────────

/** Trim and ensure a string is non-empty */
export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Basic email format check */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

/**
 * Password strength rules:
 *  - at least 8 characters
 *  - at least one uppercase letter
 *  - at least one digit
 */
export function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8)           return false;
  if (!/[A-Z]/.test(password))       return false;
  if (!/[0-9]/.test(password))       return false;
  return true;
}

/** Clamp a string to a max byte length (prevents DB column overflow) */
export function isWithinLength(value, max) {
  return typeof value === 'string' && value.length <= max;
}

// ── Auth validators ───────────────────────────────────────────────────────────

/**
 * Validate the registration payload.
 * @param {{ full_name, email, password, confirm_password }} body
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateRegister(body) {
  const errors = {};
  const { full_name, email, password, confirm_password } = body || {};

  // full_name
  if (!isNonEmpty(full_name)) {
    errors.full_name = 'Full name is required.';
  } else if (!isWithinLength(full_name.trim(), 120)) {
    errors.full_name = 'Full name must be 120 characters or fewer.';
  }

  // email
  if (!isNonEmpty(email)) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  } else if (!isWithinLength(email.trim(), 255)) {
    errors.email = 'Email address is too long.';
  }

  // password
  if (!isNonEmpty(password)) {
    errors.password = 'Password is required.';
  } else if (!isValidPassword(password)) {
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must include at least one uppercase letter.';
    } else {
      errors.password = 'Password must include at least one number.';
    }
  }

  // confirm_password
  if (!isNonEmpty(confirm_password)) {
    errors.confirm_password = 'Please confirm your password.';
  } else if (password !== confirm_password) {
    errors.confirm_password = 'Passwords do not match.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate the login payload.
 * @param {{ email, password }} body
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateLogin(body) {
  const errors = {};
  const { email, password } = body || {};

  if (!isNonEmpty(email)) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!isNonEmpty(password)) {
    errors.password = 'Password is required.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Sanitise a string: trim whitespace and lowercase.
 * @param {string} value
 * @returns {string}
 */
export function sanitizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * Sanitise a name: trim whitespace.
 * @param {string} value
 * @returns {string}
 */
export function sanitizeName(value) {
  return String(value || '').trim();
}