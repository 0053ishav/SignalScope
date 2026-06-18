export interface Track {
   id: string;
    name: string;
    artist: string;
    album?: string;
}
export interface TrackDetails {
  track_id: number;
  track_name: string;
  track_rating: number;
  track_length: number;

  track_isrc: string;
  track_spotify_id?: string;

  commontrack_id: number;

  artist_id: number;
  artist_name: string;

  album_id: number;
  album_name: string;

  instrumental: number;
  explicit: number;

  has_lyrics: number;
  has_subtitles: number;
  has_richsync: number;

  num_favourite: number;

  restricted: number;

  updated_time: string;

  album_coverart_100x100?: string;
  album_coverart_350x350?: string;
  album_coverart_500x500?: string;
  album_coverart_800x800?: string;

  track_share_url?: string;
  track_edit_url?: string;

  commontrack_isrcs?: string[][];

  primary_genres?: {
    music_genre_list: {
      music_genre: {
        music_genre_id: number;
        music_genre_parent_id: number;
        music_genre_name: string;
        music_genre_name_extended: string;
        music_genre_vanity: string;
      };
    }[];
  };

  track_lyrics_translation_status?: {
    from: string;
    to: string;
    perc: number;
  }[];

  track_lyrics_translation_options?: {
    contribution_blocked: number;
  };
}