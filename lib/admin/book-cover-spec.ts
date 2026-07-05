/** Matches bundled 3D mock-up assets (e.g. anxious-generation.png). */
export const BOOK_COVER_CANVAS_WIDTH = 1280;
export const BOOK_COVER_CANVAS_HEIGHT = 720;
export const BOOK_COVER_TARGET_FILL = 0.96;

export type BookCoverProcessOptions = {
  removeBackground?: boolean;
  resizeToCanvas?: boolean;
};

export const DEFAULT_BOOK_COVER_PROCESS: Required<BookCoverProcessOptions> = {
  removeBackground: false,
  resizeToCanvas: true,
};

export type BookCoverUploadOptions = Required<BookCoverProcessOptions>;

export const DEFAULT_BOOK_COVER_UPLOAD_OPTIONS: BookCoverUploadOptions = {
  removeBackground: false,
  resizeToCanvas: true,
};
