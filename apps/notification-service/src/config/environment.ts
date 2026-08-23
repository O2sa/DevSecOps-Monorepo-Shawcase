export interface Environment {
  port: number;
  jwtSecret: string;
  nodeEnv: string;
  allowedOrigins: string[];
}

export const environment: Environment = {
  port: parseInt(process.env.PORT || '8003', 10),
  jwtSecret: process.env.JWT_SECRET || process.env.DJANGO_SECRET_KEY || 'django-insecure-dev-only-secret-key-not-for-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:4200,http://127.0.0.1:4200')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};
