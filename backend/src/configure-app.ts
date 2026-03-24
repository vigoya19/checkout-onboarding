import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

type AppConfigurator = {
  setGlobalPrefix: (prefix: string) => void;
  enableCors: (options?: Record<string, unknown>) => void;
  use: (...args: unknown[]) => void;
  useGlobalPipes: (...args: unknown[]) => void;
};

export function configureApp(app: AppConfigurator) {
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
}
