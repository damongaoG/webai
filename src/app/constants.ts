export const CONSTANTS = {
  // Character limits for chat input
  ENGLISH_CHAR_LIMIT: 4000,
  NON_ENGLISH_CHAR_LIMIT: 2000,

  // API configurations
  API_TIMEOUT: 30000, // 30 seconds

  // Page size for listings
  PAGE_SIZE: 10,

  // Local storage keys
  STORAGE_KEYS: {
    TOKEN: "tudorai_token",
    USER: "tudorai_user",
    CHAT_DATA: "tudorai_chat_data",
  },
};

// Chat types
export enum ChatType {
  ECONOMIC_QA = 0,
  ECONOMIC_THESES = 1,
  REWRITE = 2,
}

// User roles
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

// Chat message roles
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}
