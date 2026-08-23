import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrdersApiService } from './orders-api.service';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { environment } from '../../../environments/environment';

describe('OrdersApiService', () => {
  let service: OrdersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrdersApiService],
    });

    service = TestBed.inject(OrdersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch product catalog', () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Demo Product A', price: 10.0 },
      { id: 2, name: 'Demo Product B', price: 20.0 },
    ];

    service.getProducts().subscribe((products) => {
      expect(products.length).toBe(2);
      expect(products[0].name).toBe('Demo Product A');
    });

    const req = httpMock.expectOne(`${environment.ordersServiceUrl}/api/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should fetch all system orders for administrators', () => {
    const mockOrders: Order[] = [
      {
        id: 1,
        userId: 10,
        product: { id: 1, name: 'Demo Product A', price: 10.0 },
        quantity: 2,
        status: 'PENDING',
        createdAt: '2026-08-23T00:00:00Z',
      },
    ];

    service.getAllOrders().subscribe((orders) => {
      expect(orders.length).toBe(1);
      expect(orders[0].userId).toBe(10);
      expect(orders[0].status).toBe('PENDING');
    });

    const req = httpMock.expectOne(`${environment.ordersServiceUrl}/api/orders`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should update order status via PATCH request', () => {
    const updatedOrder: Order = {
      id: 1,
      userId: 10,
      product: { id: 1, name: 'Demo Product A', price: 10.0 },
      quantity: 2,
      status: 'PROCESSING',
      createdAt: '2026-08-23T00:00:00Z',
    };

    service.updateOrderStatus(1, 'PROCESSING').subscribe((res) => {
      expect(res.status).toBe('PROCESSING');
    });

    const req = httpMock.expectOne(`${environment.ordersServiceUrl}/api/orders/1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'PROCESSING' });
    req.flush(updatedOrder);
  });
});
