import { PublicationType } from '@project/shared-types';

export const PUBLICATION_LIMITS = {
  title: { minimum: 20, maximum: 50 },
  announcement: { minimum: 50, maximum: 255 },
  text: { minimum: 100, maximum: 1024 },
  quote: { minimum: 20, maximum: 300 },
  quoteAuthor: { minimum: 3, maximum: 50 },
  description: 300,
  tags: 8,
} as const;

export const TAG_PATTERN = /^[a-zа-яё][a-zа-яё0-9-]{2,9}$/i;
export const YOUTUBE_URL_PATTERN =
  /^https?:\/\/(?:(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#\s]*&)?v=[\w-]+|(?:www\.)?youtu\.be\/[\w-]+)(?:[?&#][^\s]*)?$/i;

export const PUBLICATION_CONTENT_FIELDS = {
  [PublicationType.Video]: ['title', 'videoUrl'],
  [PublicationType.Text]: ['title', 'announcement', 'text'],
  [PublicationType.Quote]: ['text', 'quoteAuthor'],
  [PublicationType.Photo]: ['photoId'],
  [PublicationType.Link]: ['linkUrl', 'description'],
} as const;
