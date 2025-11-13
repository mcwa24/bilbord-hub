export interface PRRelease {
  id: string;
  title: string;
  description: string;
  content: string; // HTML content
  company_name: string;
  industry: string;
  tags: string[];
  thumbnail_url: string | null;
  material_links: {
    type: 'google_drive' | 'dropbox' | 'wetransfer' | 'press_room' | 'other';
    url: string;
    label: string;
  }[];
  alt_texts: {
    image_url: string;
    alt_text: string;
  }[];
  seo_meta_description: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  download_count: number;
  view_count: number;
}

export interface PRUser {
  id: string;
  email: string;
  company_name: string | null;
  full_name: string | null;
  created_at: string;
}

export interface DownloadStats {
  release_id: string;
  downloaded_at: string;
  media_name: string | null;
  media_email: string | null;
}

export interface FilterParams {
  search?: string;
  company?: string;
  industry?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
}

