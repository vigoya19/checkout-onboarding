import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import type { APIGatewayProxyEventV2, Context, Handler } from 'aws-lambda';
import express from 'express';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

let cachedServer: Handler;

async function bootstrapServer() {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  configureApp(app);

  await app.init();

  return serverlessExpress({ app: expressApp });
}

export const handler = async (
  event: APIGatewayProxyEventV2,
  context: Context,
) => {
  cachedServer ??= await bootstrapServer();

  return cachedServer(event, context, () => undefined) as Promise<unknown>;
};
