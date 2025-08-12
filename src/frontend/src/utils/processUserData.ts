/**
 * Utility functions for processing user data
 */

export interface UserData {
  id: number;
  name: string;
  email: string;
  profile?: {
    age?: number;
    location?: string;
    preferences?: Record<string, any>;
  };
  settings?: Record<string, any>;
}

export interface ProcessedUserData extends UserData {
  normalizedProfile: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProcessResult {
  success: boolean;
  data?: ProcessedUserData;
  errors?: string[];
}

/**
 * Validate user data
 */
export function validateUserData(data: UserData): ValidationResult {
  const errors: string[] = [];

  if (!data.id || typeof data.id !== 'number') {
    errors.push('Valid ID is required');
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.trim().length === 0) {
    errors.push('Name cannot be empty');
  } else if (data.name.length > 100) {
    errors.push('Name is too long');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push('Invalid email format');
  }

  if (data.profile?.age && typeof data.profile.age !== 'number') {
    errors.push('Profile age must be a number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Transform user data
 */
export function transformUserData(data: UserData): ProcessedUserData {
  return {
    ...data,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    normalizedProfile: data.profile || {}
  };
}

/**
 * Process user data - main function
 */
export function processUserData(data: UserData | null | undefined): ProcessResult {
  if (!data) {
    return { success: false, errors: ['User data is required'] };
  }

  const validation = validateUserData(data);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }

  const transformedData = transformUserData(data);
  return {
    success: true,
    data: transformedData
  };
}
