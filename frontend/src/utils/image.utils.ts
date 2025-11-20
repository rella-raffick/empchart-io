import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '../constants/defaults.constants';
import { ERROR_MESSAGES } from '../constants/app.constants';

/**
 * Convert image file to base64 string
 */
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error(ERROR_MESSAGES.INVALID_IMAGE_TYPE));
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error(ERROR_MESSAGES.IMAGE_SIZE_EXCEEDED));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error(ERROR_MESSAGES.FAILED_TO_READ_FILE));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_IMAGE_TYPE,
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.IMAGE_SIZE_EXCEEDED,
    };
  }

  return { valid: true };
};
