# Order payment workflow

Payment is required to create an order. `POST /api/orders` first stores a PENDING order using catalog prices, then calls Payment Service. The response is successful only after Payment Service returns a COMPLETED payment and Order Service saves the order as PAID. If payment is rejected or unavailable, the endpoint returns an error and the order remains PENDING.

Send the same `Idempotency-Key` (1 to 128 characters) when retrying the same checkout. Order Service stores that key with the order and uses the stable order UUID as Payment Service's idempotency key. A retry therefore resumes a pending checkout or returns the already paid order without another debit. Keep the key for the lifetime of a client retry; do not reuse it for a different checkout.

The customer and item prices in the create-order JSON remain required for API compatibility, but the charged amount is recalculated from the business catalog product prices and item quantities.

## Local Compose workflow

Start all services and databases with `docker compose up --build`. Application ports are Order 8081, Business 8082, Customer 8083, and Payment 8084. Readiness endpoints are `/actuator/health` on each service.

Create a customer via `POST http://localhost:8083/api/customers`, register a business with products via `POST http://localhost:8082/api/businesses`, then create a payment credit account:

```json
{
  "customerId": "<customer UUID>",
  "initialCredit": 100.00
}
```

Send that to `POST http://localhost:8084/api/v1/credits/accounts`. To add credit later, send `{"amount": 100.00}` to `POST /api/v1/credits/accounts/<customer UUID>/top-ups` with a UUID `Idempotency-Key` header.

Create an order with `POST http://localhost:8081/api/orders`, an `Idempotency-Key` header, and the existing create-order body using the customer UUID, business UUID, product UUID, quantity, and delivery address. Order Service returns the paid order and payment amount is checked against the catalog total.

Compose uses development credentials by default to preserve the existing local setup. Override the `*_DB_*` and `BUSINESS_MONGODB_*` values through an untracked `.env` file for local customization; production deployments must provide managed secrets.
