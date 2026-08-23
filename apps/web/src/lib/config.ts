export const config = {
  identityServiceUrl: (
    process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL || 'http://localhost:8001'
  ).replace(/\/+$/, ''),
  ordersServiceUrl: (process.env.NEXT_PUBLIC_ORDERS_SERVICE_URL || 'http://localhost:8002').replace(
    /\/+$/,
    ''
  ),
  notificationServiceUrl: (
    process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:8003'
  ).replace(/\/+$/, ''),
};
