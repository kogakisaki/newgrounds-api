export interface AudioDetails {
  id: string;
  title?: string;
  caption?: string;
  url: string;
  icon?: string;
  credits: {
    artist: string;
    url?: string;
    icon?: string;
  };
  info: {
    listens: number;
    faves?: {
      count?: number;
      view_url?: string;
    };
    downloads: number;
    votes?: number;
    score: number | string;
    tags?: string[];
    uploaded: string;
    genre: {
      [key: string]: any
    };
    file_info: {
      type: string;
      size: string;
      duration: number;
    };
    frontpaged? : {
      time: string;
      url: string;
    }
  };
  appearances?: {
    label: string;
    url?: string;
  };
  related: {
    id?: string;
    title?: string;
    url?: string;
    artist?: string;
  }[];
  licensing_terms: string;
  audio: {
    rating?: string;
    download_url?: string;
    file_url?: string;
    share_url?: string;
  };
  author_comments?: string;
  reviews?: {
    user: string;
    time: string;
    content: string;
    rated_score: number;
  }[] | boolean;
}
