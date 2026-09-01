import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const environmentSchema = z
  .object({
    PORT: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(1).max(65_535).default(3000),
    ),
    DATABASE_PATH: z.preprocess(
      emptyToUndefined,
      z.string().min(1).default('./data/kanban.sqlite'),
    ),
    AUTH_PASSWORD_HASH: z.preprocess(
      emptyToUndefined,
      z.string().min(1).optional(),
    ),
    SESSION_SECRET: z.preprocess(
      emptyToUndefined,
      z.string().min(32).optional(),
    ),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  })
  .superRefine((value, context) => {
    if (value.AUTH_PASSWORD_HASH && !value.SESSION_SECRET) {
      context.addIssue({
        code: 'custom',
        path: ['SESSION_SECRET'],
        message:
          'must be at least 32 characters when AUTH_PASSWORD_HASH is set',
      });
    }
  });

export interface Config {
  readonly authPasswordHash: string | undefined;
  readonly databasePath: string;
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly port: number;
  readonly sessionSecret: string | undefined;
}

export class ConfigError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function parseConfig(environment: NodeJS.ProcessEnv): Config {
  const result = environmentSchema.safeParse(environment);

  if (!result.success) {
    const issues = result.error.issues
      .map(
        (issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`,
      )
      .join('; ');
    throw new ConfigError(`Invalid configuration: ${issues}`);
  }

  return {
    authPasswordHash: result.data.AUTH_PASSWORD_HASH,
    databasePath: result.data.DATABASE_PATH,
    nodeEnv: result.data.NODE_ENV,
    port: result.data.PORT,
    sessionSecret: result.data.SESSION_SECRET,
  };
}
