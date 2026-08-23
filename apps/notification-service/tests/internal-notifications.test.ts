import request from 'supertest';
import { app } from '../src/app';
import { notificationRepository } from '../src/notification/notification.repository';

describe('POST /internal/notifications', () => {
  beforeEach(async () => {
    await notificationRepository.clear();
  });

  it('should create a notification successfully and return 201 Created', async () => {
    const payload = {
      userId: 5,
      type: 'ORDER_CREATED',
      title: 'Order created',
      message: 'Your order #12 has been created successfully.',
    };

    const res = await request(app).post('/internal/notifications').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      userId: 5,
      type: 'ORDER_CREATED',
      title: 'Order created',
      message: 'Your order #12 has been created successfully.',
      read: false,
      createdAt: expect.any(String),
    });
  });

  it('should return 400 Bad Request when userId is missing or <= 0', async () => {
    const resMissing = await request(app).post('/internal/notifications').send({
      type: 'ORDER_CREATED',
      title: 'Order created',
      message: 'Order created.',
    });

    expect(resMissing.status).toBe(400);
    expect(resMissing.body.message).toBe('Validation failed');
    expect(resMissing.body.errors.userId).toBeDefined();

    const resZero = await request(app).post('/internal/notifications').send({
      userId: 0,
      type: 'ORDER_CREATED',
      title: 'Order created',
      message: 'Order created.',
    });

    expect(resZero.status).toBe(400);
    expect(resZero.body.errors.userId).toBeDefined();

    const resNegative = await request(app).post('/internal/notifications').send({
      userId: -10,
      type: 'ORDER_CREATED',
      title: 'Order created',
      message: 'Order created.',
    });

    expect(resNegative.status).toBe(400);
    expect(resNegative.body.errors.userId).toBeDefined();
  });

  it('should return 400 Bad Request when notification type is invalid', async () => {
    const res = await request(app).post('/internal/notifications').send({
      userId: 5,
      type: 'INVALID_TYPE',
      title: 'Order created',
      message: 'Order created.',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors.type).toBeDefined();
  });

  it('should return 400 Bad Request when title or message is empty', async () => {
    const res = await request(app).post('/internal/notifications').send({
      userId: 5,
      type: 'ORDER_CREATED',
      title: '   ',
      message: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors.title).toBeDefined();
    expect(res.body.errors.message).toBeDefined();
  });
});
