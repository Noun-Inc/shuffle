export interface SignalImage {
  url: string;
  thumbUrl?: string;
  alt?: string;
  source?: string;
  sourceLabel?: string;
}

export interface Signal {
  id: string | number; // UUID from Supabase, or legacy number
  number: number;
  title: string;
  body: string;
  images: SignalImage[];
  category?: string;
  tags?: string[];
  year: number;
  reference?: string;
  /** Manual crop hint: "contain" for infographics, or CSS object-position like "25% 50%" */
  focalHint?: string;
  /** True when this signal was added by a participant (not a deck signal) */
  isParticipantSignal?: boolean;
}

export interface SignalComment {
  participantId: string;
  displayName: string | null;
  comment: string;
  updatedAt: string;
}
