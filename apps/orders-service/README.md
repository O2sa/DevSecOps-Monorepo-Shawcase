# Orders Service (`apps/orders-service`)

Products, inventory management, and order lifecycle microservice built with **Spring Boot 3** and Java 21.

---

## 🎯 Purpose & Future Responsibilities

- **Product Catalog Management**: Product CRUD, pricing, and stock level tracking.
- **Order Processing**: Placing, updating, and cancelling customer orders.
- **Order Status State Machine**: Order lifecycle transitions (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Event Dispatching**: Emitting order update events to the Notification Service.

*(Note: Business logic, persistence, and eventing are intentionally not implemented in Phase 1).*

---

## 🛠️ Tech Stack & Versioning

- **Framework**: Spring Boot 3.3.x
- **Runtime**: Java 21 LTS (Eclipse Temurin)
- **Build Tool**: Apache Maven 3.9+ (Maven Wrapper included)
- **Default Port**: `8002`

---

## 🚀 Running Locally

### Prerequisites
- JDK 21 installed and configured on your system (`JAVA_HOME`).

### Run via Maven Wrapper
```bash
# On Linux / macOS:
./mvnw spring-boot:run

# On Windows (PowerShell / CMD):
.\mvnw.cmd spring-boot:run
```

Or using standard Maven:
```bash
mvn spring-boot:run
```
The service will be available at [http://localhost:8002](http://localhost:8002).

---

## 🩺 Health Check Endpoints

- **Custom Health Endpoint**: `GET /health` &rarr; [http://localhost:8002/health](http://localhost:8002/health)
- **Spring Actuator Health**: `GET /actuator/health` &rarr; [http://localhost:8002/actuator/health](http://localhost:8002/actuator/health)
- **Response**:
```json
{
  "status": "UP",
  "service": "orders-service",
  "framework": "Spring Boot 3",
  "timestamp": "2026-08-22T04:40:00.000Z"
}
```

---

## 🐳 Docker Usage

### Build Container
```bash
docker build -t devsecops-orders-service .
```

### Run Container
```bash
docker run -p 8002:8002 devsecops-orders-service
```
