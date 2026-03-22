describe('main bootstrap', () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('creates the Nest app', async () => {
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };
    const create = jest.fn().mockResolvedValue(app);

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create },
    }));

    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise(process.nextTick);

    expect(create).toHaveBeenCalledTimes(1);
  });

  it('sets the api prefix', async () => {
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: jest.fn().mockResolvedValue(app) },
    }));

    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise(process.nextTick);

    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
  });

  it('enables cors', async () => {
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: jest.fn().mockResolvedValue(app) },
    }));

    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise(process.nextTick);

    expect(app.enableCors).toHaveBeenCalledTimes(1);
  });

  it('registers validation pipes', async () => {
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: jest.fn().mockResolvedValue(app) },
    }));

    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise(process.nextTick);

    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1);
  });

  it('listens on port 3000 by default', async () => {
    const app = {
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    jest.doMock('@nestjs/core', () => ({
      NestFactory: { create: jest.fn().mockResolvedValue(app) },
    }));

    jest.isolateModules(() => {
      require('./main');
    });
    await new Promise(process.nextTick);

    expect(app.listen).toHaveBeenCalledWith(3000);
  });
});

