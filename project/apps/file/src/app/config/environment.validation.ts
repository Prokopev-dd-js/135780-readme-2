import * as Joi from 'joi';

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const { error, value } = Joi.object({
    PORT: Joi.number().port().default(3002),
    UPLOAD_DIRECTORY: Joi.string().default('apps/file/uploads'),
  }).validate(config, { abortEarly: false, allowUnknown: true });
  if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
  }
  return value;
}
