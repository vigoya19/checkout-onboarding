import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);

  configureApp(app);

  await app.listen(Number.isNaN(port) ? 3000 : port);

  return app;
}

void bootstrap();
