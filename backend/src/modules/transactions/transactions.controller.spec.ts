import { TransactionsController, WompiWebhookController } from './transactions.controller';

describe('TransactionsController', () => {
  it('delegates transaction creation', async () => {
    const execute = jest.fn().mockResolvedValue('created');
    const controller = new TransactionsController(
      { execute } as never,
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
    );

    await expect(controller.createTransaction({} as never)).resolves.toBe('created');
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('delegates transaction retrieval', async () => {
    const execute = jest.fn().mockResolvedValue('transaction');
    const controller = new TransactionsController(
      { execute: jest.fn() } as never,
      { execute } as never,
      { execute: jest.fn() } as never,
    );

    await expect(controller.getTransaction('tx-1')).resolves.toBe('transaction');
    expect(execute).toHaveBeenCalledWith('tx-1');
  });

  it('resolves the customer ip from a string x-forwarded-for header', async () => {
    const execute = jest.fn().mockResolvedValue('paid');
    const controller = new TransactionsController(
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      { execute } as never,
    );

    await controller.payTransaction(
      'tx-1',
      { installments: 1 } as never,
      { headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2' }, ip: '127.0.0.1' } as never,
    );

    expect(execute).toHaveBeenCalledWith(
      'tx-1',
      expect.objectContaining({ customerIp: '10.0.0.1' }),
    );
  });

  it('resolves the customer ip from an array x-forwarded-for header', async () => {
    const execute = jest.fn().mockResolvedValue('paid');
    const controller = new TransactionsController(
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      { execute } as never,
    );

    await controller.payTransaction(
      'tx-1',
      { installments: 1 } as never,
      { headers: { 'x-forwarded-for': ['10.0.0.3'] }, ip: '127.0.0.1' } as never,
    );

    expect(execute).toHaveBeenCalledWith(
      'tx-1',
      expect.objectContaining({ customerIp: '10.0.0.3' }),
    );
  });

  it('falls back to request ip when forwarded headers are missing', async () => {
    const execute = jest.fn().mockResolvedValue('paid');
    const controller = new TransactionsController(
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      { execute } as never,
    );

    await controller.payTransaction(
      'tx-1',
      { installments: 1 } as never,
      { headers: {}, ip: '127.0.0.1' } as never,
    );

    expect(execute).toHaveBeenCalledWith(
      'tx-1',
      expect.objectContaining({ customerIp: '127.0.0.1' }),
    );
  });

  it('keeps the payload customer ip when it is already provided', async () => {
    const execute = jest.fn().mockResolvedValue('paid');
    const controller = new TransactionsController(
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      { execute } as never,
    );

    await controller.payTransaction(
      'tx-1',
      { installments: 1, customerIp: '192.168.0.10' } as never,
      { headers: { 'x-forwarded-for': '10.0.0.1' }, ip: '127.0.0.1' } as never,
    );

    expect(execute).toHaveBeenCalledWith(
      'tx-1',
      expect.objectContaining({ customerIp: '192.168.0.10' }),
    );
  });

  it('falls back to localhost when request ip is missing', async () => {
    const execute = jest.fn().mockResolvedValue('paid');
    const controller = new TransactionsController(
      { execute: jest.fn() } as never,
      { execute: jest.fn() } as never,
      { execute } as never,
    );

    await controller.payTransaction(
      'tx-1',
      { installments: 1 } as never,
      { headers: { 'x-forwarded-for': [] }, ip: undefined } as never,
    );

    expect(execute).toHaveBeenCalledWith(
      'tx-1',
      expect.objectContaining({ customerIp: '127.0.0.1' }),
    );
  });
});

describe('WompiWebhookController', () => {
  it('delegates webhook handling', async () => {
    const execute = jest.fn().mockResolvedValue('ok');
    const controller = new WompiWebhookController({ execute } as never);

    await expect(controller.handleWebhook({} as never)).resolves.toBe('ok');
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
