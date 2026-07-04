export type UserRole = "student" | "admin";
export type VideoProvider = "cloudflare_stream" | "external";
export type MaterialType = "pdf" | "slide" | "sheet" | "document" | "image" | "archive" | "code" | "link" | "other";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  last_access_at: string | null;
};

export type Module = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  position: number;
  is_published: boolean;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string | null;
  position: number;
  video_provider: VideoProvider;
  video_uid: string | null;
  external_video_url: string | null;
  duration_seconds: number | null;
  is_published: boolean;
};

export type LessonMaterial = {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  material_type: MaterialType;
  storage_path: string | null;
  external_url: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  position: number;
  is_published: boolean;
};
