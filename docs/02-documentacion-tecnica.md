# Documentacion tecnica

## Estructura del repositorio

```text
/
|-- backend/
|-- frontend/
|-- postman/
|-- docs/
|-- package.json
```

## Monorepo

El repositorio usa `npm workspaces`.

- La raiz orquesta `frontend` y `backend`
- El `node_modules` de la raiz contiene dependencias hoisteadas
- Cada workspace puede tener dependencias propias cuando hace falta

Archivo clave:

- [package.json](c:/Users/quich/Documents/PruebaWompi/package.json)

## Frontend

### Stack

- React
- Redux Toolkit
- React Router
- Vite
- Jest + Testing Library

### Estructura principal

```text
frontend/src
|-- app/
|-- features/
|   |-- catalog/
|   |-- checkout/
|   |-- payments/
|   |-- transactions/
|-- shared/
|-- test/
```

### Responsabilidades

- Cargar catalogo desde backend
- Mantener producto seleccionado en Redux
- Persistir avance del checkout en `localStorage`
- Solicitar tokens de aceptacion
- Tokenizar tarjeta con Wompi
- Crear transaccion local
- Enviar pago al backend
- Mostrar estados `success`, `failure` o `pending`

### Archivos clave

- [ProductPage.tsx](c:/Users/quich/Documents/PruebaWompi/frontend/src/features/catalog/pages/ProductPage.tsx)
- [CheckoutModal.tsx](c:/Users/quich/Documents/PruebaWompi/frontend/src/features/checkout/components/CheckoutModal.tsx)
- [SummaryBackdrop.tsx](c:/Users/quich/Documents/PruebaWompi/frontend/src/features/checkout/components/SummaryBackdrop.tsx)
- [FinalStatusPanel.tsx](c:/Users/quich/Documents/PruebaWompi/frontend/src/features/checkout/components/FinalStatusPanel.tsx)
- [catalog.slice.ts](c:/Users/quich/Documents/PruebaWompi/frontend/src/features/catalog/catalog.slice.ts)
- [checkout.slice.ts](c:/Users/quich/Documents/PruebaWompi/frontend/src/features/checkout/checkout.slice.ts)

## Backend

### Stack

- NestJS
- TypeScript
- DynamoDB
- AWS SDK v3
- Serverless Framework
- Jest

### Estructura principal

```text
backend/src
|-- modules/
|   |-- catalog/
|   |-- customers/
|   |-- deliveries/
|   |-- health/
|   |-- payments/
|   |-- transactions/
|-- shared/
|   |-- infrastructure/
```

### Capas

- `domain`: entidades del negocio
- `application`: casos de uso y puertos
- `infrastructure`: repositorios Dynamo e in-memory, cliente Wompi, modulos
- `controller`: entrada HTTP

### Endpoints expuestos

- `GET /api/health`
- `GET /api/products`
- `GET /api/payments/acceptance-tokens`
- `POST /api/transactions`
- `GET /api/transactions/:transactionId`
- `POST /api/transactions/:transactionId/pay`
- `POST /api/webhooks/wompi`

### Archivos clave

- [transactions.controller.ts](c:/Users/quich/Documents/PruebaWompi/backend/src/modules/transactions/transactions.controller.ts)
- [process-transaction-payment.use-case.ts](c:/Users/quich/Documents/PruebaWompi/backend/src/modules/transactions/application/use-cases/process-transaction-payment.use-case.ts)
- [get-transaction.use-case.ts](c:/Users/quich/Documents/PruebaWompi/backend/src/modules/transactions/application/use-cases/get-transaction.use-case.ts)
- [handle-wompi-webhook.use-case.ts](c:/Users/quich/Documents/PruebaWompi/backend/src/modules/transactions/application/use-cases/handle-wompi-webhook.use-case.ts)
- [fulfill-approved-transaction.use-case.ts](c:/Users/quich/Documents/PruebaWompi/backend/src/modules/transactions/application/use-cases/fulfill-approved-transaction.use-case.ts)
- [wompi.gateway.ts](c:/Users/quich/Documents/PruebaWompi/backend/src/modules/payments/infrastructure/gateways/wompi.gateway.ts)
- [serverless.yml](c:/Users/quich/Documents/PruebaWompi/backend/serverless.yml)

## Modelo de datos

### Products

- `productId`
- `name`
- `description`
- `priceInCents`
- `currency`
- `stock`

### Transactions

- `transactionId`
- `reference`
- `productId`
- `customerName`
- `customerEmail`
- `customerPhone`
- `addressLine1`
- `city`
- `department`
- `amountInCents`
- `baseFeeInCents`
- `deliveryFeeInCents`
- `paymentStatus`
- `fulfillmentStatus`
- `createdAt`
- `wompiTransactionId`
- `paymentMethodType`
- `paymentStatusMessage`
- `cardBrand`
- `cardLastFour`

### Customers

- `customerId`
- `fullName`
- `email`
- `phone`
- `createdAt`

### Deliveries

- `deliveryId`
- `transactionId`
- `customerEmail`
- `addressLine1`
- `city`
- `status`
- `createdAt`

## Seed de productos

El seed vive en:

- [seed-products.cjs](c:/Users/quich/Documents/PruebaWompi/backend/scripts/seed-products.cjs)

Productos cargados:

- PlayStation 4
- PlayStation 5
- Xbox Series X
- Xbox Series S
- Nintendo Switch
- Nintendo Switch 2

## Cobertura

### Frontend

- `npm run test:cov`
- Statements: 97.29%
- Branches: 84.61%
- Functions: 93.02%
- Lines: 97.09%

### Backend

- `npm run test:cov -- --runInBand`
- Statements: 100%
- Branches: 92.36%
- Functions: 100%
- Lines: 100%
