// 파일 업로드 검증 유틸리티

// 파일 타입별 Magic Number
const FILE_SIGNATURES = {
  // 이미지 파일
  'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
  'image/png': ['89504e47'],
  'image/gif': ['47494638'],
  'image/webp': ['52494646'], // RIFF
  'image/bmp': ['424d'],
  'image/tiff': ['49492a00', '4d4d002a'],
  
  // 문서 파일 (추가 보안)
  'application/pdf': ['25504446'],
  'application/zip': ['504b0304', '504b0506', '504b0708'],
  'application/x-rar-compressed': ['526172211a0700'],
} as const;

// 허용된 파일 타입
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
] as const;

// 최대 파일 크기 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: string;
  fileSize?: number;
}

/**
 * 파일의 Magic Number를 확인하여 실제 파일 타입을 검증
 */
export const validateFileMagicNumber = async (file: File): Promise<FileValidationResult> => {
  try {
    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다.`,
        fileSize: file.size,
      };
    }

    // 파일 타입 검증
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      return {
        isValid: false,
        error: '허용되지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 허용)',
        fileType: file.type,
      };
    }

    // Magic Number 검증
    const arrayBuffer = await file.slice(0, 8).arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // 16진수 문자열로 변환
    let hex = '';
    for (let i = 0; i < uint8Array.length; i++) {
      hex += uint8Array[i].toString(16).padStart(2, '0');
    }

    // 파일 타입별 시그니처 확인
    const expectedSignatures = FILE_SIGNATURES[file.type as keyof typeof FILE_SIGNATURES];
    
    if (!expectedSignatures) {
      return {
        isValid: false,
        error: '지원하지 않는 파일 형식입니다.',
        fileType: file.type,
      };
    }

    // 시그니처 매칭 확인
    const isValidSignature = expectedSignatures.some(signature => 
      hex.toLowerCase().startsWith(signature.toLowerCase())
    );

    if (!isValidSignature) {
      return {
        isValid: false,
        error: '파일 내용이 선언된 형식과 일치하지 않습니다. (잠재적 보안 위험)',
        fileType: file.type,
      };
    }

    // 파일명 검증 (경로 조작 방지)
    const safeFileName = sanitizeFileName(file.name);
    if (safeFileName !== file.name) {
      return {
        isValid: false,
        error: '파일명에 허용되지 않는 문자가 포함되어 있습니다.',
      };
    }

    return {
      isValid: true,
      fileType: file.type,
      fileSize: file.size,
    };

  } catch (error) {
    return {
      isValid: false,
      error: '파일 검증 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 파일명 살균 처리 (경로 조작 방지)
 */
export const sanitizeFileName = (fileName: string): string => {
  // 위험한 문자 제거
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // 영문, 숫자, 점, 언더스코어, 하이픈만 허용
    .replace(/\.{2,}/g, '.') // 연속된 점 제거
    .replace(/^\.+|\.+$/g, '') // 시작과 끝의 점 제거
    .substring(0, 255); // 파일명 길이 제한
};

/**
 * 파일 확장자 검증
 */
export const validateFileExtension = (fileName: string): boolean => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  return allowedExtensions.includes(extension);
};

/**
 * 종합 파일 검증
 */
export const validateFile = async (file: File): Promise<FileValidationResult> => {
  // 1. 기본 검증
  if (!file) {
    return { isValid: false, error: '파일이 선택되지 않았습니다.' };
  }

  // 2. 확장자 검증
  if (!validateFileExtension(file.name)) {
    return { 
      isValid: false, 
      error: '허용되지 않는 파일 확장자입니다. (jpg, jpeg, png, gif, webp만 허용)' 
    };
  }

  // 3. Magic Number 검증
  return await validateFileMagicNumber(file);
};

/**
 * 이미지 파일인지 확인
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/') && 
         ALLOWED_IMAGE_TYPES.includes(file.type as any);
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
