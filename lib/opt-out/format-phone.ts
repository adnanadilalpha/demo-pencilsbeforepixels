/** Format a US phone number as (XXX) XXX-XXXX when 10 digits are present. */
export function formatPhoneNumber(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return trimmed;
}

/** Strip non-digits and cap at 10 digits while formatting for display. */
export function sanitizePhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Empty values are allowed; partial or overlong numbers are invalid. */
export function isValidUsPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (!digits) return true;
  if (digits.length !== 10) return false;

  const areaCode = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);

  // NANP: area code and exchange cannot start with 0 or 1.
  if (/^[01]/.test(areaCode) || /^[01]/.test(exchange)) {
    return false;
  }

  // Reject obvious placeholders like 0000000000, 1111111111, 2222222222.
  if (/^(\d)\1{9}$/.test(digits)) {
    return false;
  }

  return true;
}

export function phoneValidationMessage(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length !== 10) {
    return "Enter a valid 10-digit US phone number.";
  }
  if (!isValidUsPhone(value)) {
    return "Enter a real US phone number, not a placeholder like 000-000-0000.";
  }
  return null;
}
