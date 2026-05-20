import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status', () => {
      const result = controller.checkHealth();
      expect(result).toEqual({
        status: 'ok',
        service: 'api-gateway',
      });
    });

    it('should have status property as "ok"', () => {
      const result = controller.checkHealth();
      expect(result.status).toBe('ok');
    });

    it('should have service property as "api-gateway"', () => {
      const result = controller.checkHealth();
      expect(result.service).toBe('api-gateway');
    });
  });
});