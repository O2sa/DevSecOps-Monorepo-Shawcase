export interface Environment {
  port: number;
  jwtSecret: string;
  nodeEnv: string;
}

export const environment: Environment = {
  port: parseInt(process.env.PORT || '8003', 10),
  jwtSecret: process.env.JWT_SECRET || process.env.DJANGO_SECRET_KEY || 'django-insecure-dev-only-secret-key-not-for-production',
  nodeEnv: process.env.NODE_ENV || 'development',
};
