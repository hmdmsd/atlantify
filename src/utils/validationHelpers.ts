import { formatFileSize } from "./formatTime";

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Password validation rules
 */
export const isValidPassword = (
  password: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate file type and size
 */
export const validateFile = (
  file: File,
  allowedTypes: string[],
  maxSize: number
): { isValid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not supported. Allowed types: ${allowedTypes.join(
        ", "
      )}`,
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${formatFileSize(maxSize)}`,
    };
  }

  return { isValid: true };
};

/**
 * Form validation helper
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, (value: any) => boolean | string>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field]);
    if (typeof result === "string") {
      errors[field as keyof T] = result;
    } else if (!result) {
      errors[field as keyof T] = `Invalid ${field}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
