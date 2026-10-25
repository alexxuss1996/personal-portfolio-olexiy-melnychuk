// Contact form rules, parsing, and email content.
// Kept independent from Astro components so the rules stay easy to read and test.

export const CONTACT_FIELDS = [
  "name",
  "surname",
  "phone",
  "email",
  "message",
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactValues = Record<ContactField, string>;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export interface ContactEmail {
  subject: string;
  text: string;
  html: string;
}

export function createEmptyContactValues(): ContactValues {
  return {
    name: "",
    surname: "",
    phone: "",
    email: "",
    message: "",
  };
}

export function readContactValues(formData: FormData): ContactValues {
  const values = createEmptyContactValues();

  for (const field of CONTACT_FIELDS) {
    values[field] = String(formData.get(field) ?? "").trim();
  }

  return values;
}

export function validateContact(values: ContactValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!values.name) {
    errors.name = "First name is required.";
  } else if (values.name.length < 2) {
    errors.name = "Use at least 2 characters.";
  } else if (values.name.length > 60) {
    errors.name = "Use at most 60 characters.";
  }

  if (values.surname.length > 60) {
    errors.surname = "Use at most 60 characters.";
  }

  if (values.phone) {
    const phonePattern = /^[+()\d\s-]{7,20}$/;
    const digitCount = (values.phone.match(/\d/g) ?? []).length;

    if (!phonePattern.test(values.phone) || digitCount < 7) {
      errors.phone = "Enter a valid phone number.";
    }
  }

  if (!values.email) {
    errors.email = "Email is required.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ||
    values.email.length > 254
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.message) {
    errors.message = "Message is required.";
  } else if (values.message.length < 10) {
    errors.message = "Use at least 10 characters.";
  } else if (values.message.length > 2000) {
    errors.message = "Use at most 2000 characters.";
  }

  return errors;
}

export function buildContactEmail(values: ContactValues): ContactEmail {
  const subject = `Message from ${values.name} ${values.surname}`.trim();
  const details: Array<[label: string, value: string]> = [
    ["Name", values.name],
    ["Surname", values.surname],
    ["Phone", values.phone],
    ["Email", values.email],
    ["Message", values.message],
  ];

  return {
    subject,
    text: values.message,
    html: details
      .map(
        ([label, value]) => `<strong>${label}: </strong>${escapeHtml(value)}`,
      )
      .join("<br>"),
  };
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return value.replace(/[&<>"']/g, (char) => entities[char]!);
}
