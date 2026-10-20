const DATABASE_MAXIMUM_OFFSET = 2_147_483_647;
const PAGE_SIZE = { publications: 25, comments: 50 } as const;

export const QUERY_LIMITS = {
  defaultPage: 1,
  publicationsPerPage: PAGE_SIZE.publications,
  commentsPerPage: PAGE_SIZE.comments,
  maximumPage: Math.floor(
    DATABASE_MAXIMUM_OFFSET /
      Math.max(PAGE_SIZE.publications, PAGE_SIZE.comments),
  ),
  searchResults: 20,
} as const;
