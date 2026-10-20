export const SEED_ID = {
  author: {
    first: '11111111-1111-4111-8111-111111111111',
    second: '22222222-2222-4222-8222-222222222222',
  },
  publication: {
    first: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    second: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    third: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  },
  comment: {
    first: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    second: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  },
  like: {
    first: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    second: '99999999-9999-4999-8999-999999999999',
  },
} as const;

export const SEED_CONTENT = {
  legacyText:
    'Создаём PrismaModule, генерируем клиент и используем репозиторий для работы с PostgreSQL.',
  text: 'Создаём PrismaModule, генерируем клиент и используем репозиторий для работы с PostgreSQL. Для каждого сценария отделяем бизнес-логику от хранения данных и проверяем корректность запросов.',
  legacyTags: ['architecture'],
  tags: ['architect'],
} as const;
