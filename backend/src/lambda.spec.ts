describe('lambda handler', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('creates the express app only once', async () => {
    const expressApp = { use: jest.fn() };
    const express = jest.fn(() => expressApp);
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      init: jest.fn(),
    };
    const create = jest.fn().mockResolvedValue(app);
    const configuredHandler = jest.fn().mockResolvedValue({ ok: true });

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create },
    }));
    jest.doMock('@codegenie/serverless-express', () => ({
      configure: jest.fn(() => configuredHandler),
    }));
    jest.doMock('express', () => ({
      __esModule: true,
      default: express,
    }));

    let handler!: (event: unknown, context: unknown) => Promise<unknown>;

    jest.isolateModules(() => {
      ({ handler } = require('./lambda') as {
        handler: (event: unknown, context: unknown) => Promise<unknown>;
      });
    });

    await handler({}, {});
    await handler({}, {});

    expect(express).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('initializes the Nest app', async () => {
    const expressApp = { use: jest.fn() };
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      init: jest.fn(),
    };
    const configuredHandler = jest.fn().mockResolvedValue({ ok: true });

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: jest.fn().mockResolvedValue(app) },
    }));
    jest.doMock('@codegenie/serverless-express', () => ({
      configure: jest.fn(() => configuredHandler),
    }));
    jest.doMock('express', () => ({
      __esModule: true,
      default: jest.fn(() => expressApp),
    }));

    let handler!: (event: unknown, context: unknown) => Promise<unknown>;

    jest.isolateModules(() => {
      ({ handler } = require('./lambda') as {
        handler: (event: unknown, context: unknown) => Promise<unknown>;
      });
    });

    await handler({}, {});

    expect(app.init).toHaveBeenCalledTimes(1);
  });

  it('returns the configured serverless response', async () => {
    const configuredHandler = jest.fn().mockResolvedValue({ ok: true });

    jest.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: jest.fn().mockResolvedValue({
          setGlobalPrefix: jest.fn(),
          enableCors: jest.fn(),
          use: jest.fn(),
          useGlobalPipes: jest.fn(),
          init: jest.fn(),
        }),
      },
    }));
    jest.doMock('@codegenie/serverless-express', () => ({
      configure: jest.fn(() => configuredHandler),
    }));
    jest.doMock('express', () => ({
      __esModule: true,
      default: jest.fn(() => ({ use: jest.fn() })),
    }));

    let handler!: (event: unknown, context: unknown) => Promise<unknown>;

    jest.isolateModules(() => {
      ({ handler } = require('./lambda') as {
        handler: (event: unknown, context: unknown) => Promise<unknown>;
      });
    });

    await expect(handler({ rawPath: '/api/health' }, {})).resolves.toEqual({
      ok: true,
    });
  });

  it('registers security middleware when bootstrapping lambda', async () => {
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      init: jest.fn(),
    };

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: jest.fn().mockResolvedValue(app) },
    }));
    jest.doMock('@codegenie/serverless-express', () => ({
      configure: jest.fn(() => jest.fn().mockResolvedValue({ ok: true })),
    }));
    jest.doMock('express', () => ({
      __esModule: true,
      default: jest.fn(() => ({ use: jest.fn() })),
    }));

    let handler!: (event: unknown, context: unknown) => Promise<unknown>;

    jest.isolateModules(() => {
      ({ handler } = require('./lambda') as {
        handler: (event: unknown, context: unknown) => Promise<unknown>;
      });
    });

    await handler({}, {});

    expect(app.use).toHaveBeenCalledTimes(1);
  });
});
