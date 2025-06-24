export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  artist: string;
  short_description: string;
  views: number | null;
  score: number | null;
  genre?: string;
}

export interface PlaylistDetails {
  id: string;
  title?: string;
  url: string;
  thumbnail: string;
  author: {
    name?: string;
    icon?: string;
    url?: string;
  };
  items: PlaylistItem[] | [];
}
