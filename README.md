# SmartCart - E-Commerce Order Management System

SmartCart is a training mini-project built from the supplied Angular storefront and a Java 17 / Spring Boot microservices backend. It covers OOP, exceptions, collections and streams, SQL, Spring Core, JPA/Hibernate, Spring Security, Config Server, Gateway routing, Feign, Resilience4j retry/circuit breaker, and global REST exception handling.

## Architecture

```text
Angular Client :4200
        |
API Gateway :8080  (JWT authorization and routes)
   |        |        |
Users     Products   Orders
:8081     :8082      :8083 --Feign--> Users / Products
        Config Server :8888
```

`Discovery Server` is not included because it was optional in the project guide; service URLs are centralized by Config Server.

## Features

| Role | Capabilities |
| --- | --- |
| User | Register, login, browse/search products, place orders, view order history |
| Admin | Login, add/update/delete products, view all orders through secured APIs |

The gateway accepts product `GET` requests publicly. It requires JWT authentication for orders and restricts product modifications plus `GET /api/orders` to the `ADMIN` role.

## Projects

| Module | Purpose | Port |
| --- | --- | --- |
| `backend/config-server` | Native central configuration | 8888 |
| `backend/api-gateway` | Routes and JWT/role enforcement | 8080 |
| `backend/user-service` | Users, BCrypt passwords, JWT authentication | 8081 |
| `backend/product-service` | Catalog CRUD, validation, stock, streams filtering/sorting | 8082 |
| `backend/order-service` | Orders, Feign calls, retry and circuit breaker | 8083 |
| Repository root Angular app | SmartCart web client | 4200 |

## Run Locally

Prerequisites: Java 17, Maven 3.9+, Node.js/npm, and optionally Docker Desktop for MySQL.

### From VS Code

The workspace points at Temurin JDK 17 in `C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot` and Maven in `C:\Users\abhis\Tools\apache-maven-3.9.9`. Node.js/npm and Git are installed under `C:\Program Files`.

Reload VS Code once after opening this project (`Ctrl+Shift+P` then **Developer: Reload Window**) and create a fresh terminal. This makes the newly installed tools available and clears the JDK warning.

Open **Terminal > Run Task**. Run `SmartCart: Install UI Dependencies` once, then start these tasks in order, leaving each terminal open:

1. `SmartCart: Start Config Server`
2. `SmartCart: Start User Service`
3. `SmartCart: Start Product Service`
4. `SmartCart: Start Order Service`
5. `SmartCart: Start API Gateway`
6. `SmartCart: Start UI`

For compile checks, run `SmartCart: Build Backend` and `SmartCart: Build UI`.

For a quick demonstration, services use in-memory H2 databases and seed data by default:

```powershell
cd backend
mvn -pl config-server spring-boot:run
mvn -pl user-service spring-boot:run
mvn -pl product-service spring-boot:run
mvn -pl order-service spring-boot:run
mvn -pl api-gateway spring-boot:run
```

Run each Maven line in its own terminal. Then start the UI from the repository root:

```powershell
npm install
npm start
```

Open `http://localhost:4200`. Demonstration credentials are `demo` / `demo123` for a customer and `admin` / `admin123` for an administrator.

## MySQL Profile

The table definitions requested in the guide are in `database/schema.sql`, with joins, aggregation, grouping, and filtering practice in `database/practice-queries.sql`.

```powershell
docker compose up -d
$env:SPRING_PROFILES_ACTIVE='mysql'
$env:DB_USERNAME='root'
$env:DB_PASSWORD='root'
```

Start Config Server and each backend application after applying the environment variables. Spring Data JPA maps directly to the `users`, `products`, and `orders` tables.

## API Summary

| Method | Gateway endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/products?search=&sort=priceAsc` | Public |
| `GET` | `/api/products/{id}` | Public |
| `POST`, `PUT`, `DELETE` | `/api/products` and `/api/products/{id}` | Admin JWT |
| `POST` | `/api/orders` | User/Admin JWT |
| `GET` | `/api/orders/history` | User/Admin JWT |
| `GET` | `/api/orders` | Admin JWT |

Import `postman/SmartCart.postman_collection.json` into Postman. Login requests automatically store `token` and `adminToken` collection variables for protected calls.

## Requirement Mapping

- DTOs are used by all external endpoints; JPA entities stay inside services.
- SLF4J logging records registrations, authentication, catalog changes, reservations, and orders.
- `ProductService.findAll` demonstrates stream filtering, mapping, and sorting.
- Each domain service has validation and a `@RestControllerAdvice` global exception handler.
- `CatalogService` in Order Service wraps Feign calls using Resilience4j circuit breaker and retry fallbacks.
- Passwords are BCrypt encoded; JWT roles are checked at the gateway.
