import { AssistantController } from './assistant.controller';

describe('AssistantController', () => {
  it('delegates assistant questions to the use case', async () => {
    const execute = jest.fn().mockResolvedValue('respuesta');
    const controller = new AssistantController({ execute } as never);

    await expect(controller.ask({ message: 'hola' })).resolves.toEqual({
      answer: 'respuesta',
    });
    expect(execute).toHaveBeenCalledWith({ message: 'hola' });
  });
});
