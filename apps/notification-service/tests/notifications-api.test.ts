import request from 'supertest';
import { app } from '../src/app';
import { notificationRepository } from '../src/notification/notification.repository';
import { NotificationType } from '../src/notification/notification.model';
import { generateUserToken } from './test-utils';

describe('User Notifications API (/api/notifications)', () => {
  beforeEach(async () => {
    await notificationRepository.clear();
  });

  const userAToken = generateUserToken(10, 'alice');
  const userBToken = generateUserToken(20, 'bob');

  it('GET /api/notifications without JWT should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Authentication required' });
  });

  it('GET /api/notifications should return only notifications belonging to authenticated user', async () => {
    // Seed notifications for Alice (userId: 10) and Bob (userId: 20)
    await notificationRepository.create({
      userId: 10,
      type: NotificationType.ORDER_CREATED,
      title: 'Alice Order #1',
      message: 'Alice order #1 created.',
    });
    await notificationRepository.create({
      userId: 10,
      type: NotificationType.ORDER_CREATED,
      title: 'Alice Order #2',
      message: 'Alice order #2 created.',
    });
    await notificationRepository.create({
      userId: 20,
      type: NotificationType.ORDER_CREATED,
      title: 'Bob Order #1',
      message: 'Bob order #1 created.',
    });

    // Alice queries /api/notifications
    const aliceRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(aliceRes.status).toBe(200);
    expect(aliceRes.body).toHaveLength(2);
    expect(aliceRes.body[0].title).toBe('Alice Order #1');
    expect(aliceRes.body[1].title).toBe('Alice Order #2');

    // Bob queries /api/notifications
    const bobRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(bobRes.status).toBe(200);
    expect(bobRes.body).toHaveLength(1);
    expect(bobRes.body[0].title).toBe('Bob Order #1');
  });

  it('GET /api/notifications/unread should return only unread notifications for authenticated user', async () => {
    const n1 = await notificationRepository.create({
      userId: 10,
      type: NotificationType.ORDER_CREATED,
      title: 'Order 1',
      message: 'Msg 1',
    });
    await notificationRepository.create({
      userId: 10,
      type: NotificationType.ORDER_CREATED,
      title: 'Order 2',
      message: 'Msg 2',
    });

    // Mark n1 as read
    await notificationRepository.markAsRead(n1.id, 10);

    const res = await request(app)
      .get('/api/notifications/unread')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Order 2');
    expect(res.body[0].read).toBe(false);
  });

  it('PATCH /api/notifications/:id/read should mark own notification as read', async () => {
    const n = await notificationRepository.create({
      userId: 10,
      type: NotificationType.ORDER_CREATED,
      title: 'Order 1',
      message: 'Msg 1',
    });

    const res = await request(app)
      .patch(`/api/notifications/${n.id}/read`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(n.id);
    expect(res.body.read).toBe(true);

    // Verify it is updated in DB
    const fetched = await notificationRepository.findById(n.id);
    expect(fetched?.read).toBe(true);
  });

  it('PATCH /api/notifications/:id/read should return 404 when trying to mark another user notification as read', async () => {
    const aliceNotification = await notificationRepository.create({
      userId: 10,
      type: NotificationType.ORDER_CREATED,
      title: 'Alice Order',
      message: 'Alice msg',
    });

    // Bob attempts to mark Alice's notification as read
    const res = await request(app)
      .patch(`/api/notifications/${aliceNotification.id}/read`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Notification not found' });

    // Verify Alice's notification remains unread
    const untouched = await notificationRepository.findById(aliceNotification.id);
    expect(untouched?.read).toBe(false);
  });

  it('PATCH /api/notifications/:id/read on nonexistent notification should return 404', async () => {
    const res = await request(app)
      .patch('/api/notifications/9999/read')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Notification not found' });
  });
});
