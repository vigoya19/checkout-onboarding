# Checkout Onboarding

Aplicación full stack para un flujo de compra guiada de un solo producto, con pago con tarjeta usando Wompi Sandbox, backend serverless en AWS y un asistente IA conectado por backend.

## Indice de lectura

Este `README` funciona como portada y guía de navegación de toda la documentación del proyecto.

### 1. Vista general

- [Documentación del proyecto](./docs/04-documentacion-del-proyecto.md)
- [Casos de uso](./docs/01-casos-de-uso.md)

### 2. Arquitectura y diseño

- [Arquitectura](./docs/03-arquitectura.md)
- [Documentación técnica](./docs/02-documentacion-tecnica.md)

### 3. API y contratos

- [Endpoints y contratos](./docs/07-endpoints-y-contratos.md)
- [Colección Postman](./postman/checkout-onboarding.postman_collection.json)
- [README de Postman](./postman/README.md)

### 4. Ejecución y pruebas

- [Guía de pruebas](./docs/05-guia-de-pruebas.md)
- [frontend/.env.example](./frontend/.env.example)
- [backend/.env.example](./backend/.env.example)

## Resumen de la solución

- Frontend SPA en React 19 + Redux Toolkit + Vite
- Backend en NestJS 11 + TypeScript
- Persistencia en DynamoDB
- Infraestructura serverless con AWS Lambda + API Gateway
- Frontend publicado con S3 + CloudFront
- Integración de pagos con Wompi Sandbox
- Asistente IA conectado a OpenAI por backend
- Headers de seguridad en backend con `helmet`

## Diagrama de arquitectura

![Diagrama de arquitectura](./frontend/public/product-images/DiagramaArquitectura.png)

Documentación relacionada:

- [Arquitectura](./docs/03-arquitectura.md)
- [Documentación técnica](./docs/02-documentacion-tecnica.md)

## Diagrama de flujo

![Diagrama de flujo](./frontend/public/product-images/DiagramaFlujo.png)

Documentación relacionada:

- [Casos de uso](./docs/01-casos-de-uso.md)
- [Guía de pruebas](./docs/05-guia-de-pruebas.md)

## Flujo funcional implementado

1. El usuario consulta el catálogo desde el frontend.
2. Visualiza el detalle de un producto y decide iniciar la compra.
3. El frontend carga la configuración del pago y los acceptance tokens.
4. El usuario diligencia tarjeta, datos personales y dirección de entrega.
5. El frontend tokeniza la tarjeta con Wompi.
6. El backend crea la transacción local y procesa el pago en Wompi Sandbox.
7. El sistema actualiza el estado de la transacción.
8. Si el pago es aprobado, se crea el delivery, se actualiza el customer y se descuenta el stock.
9. El usuario ve el estado final del pago y vuelve al catálogo con inventario actualizado.

## Mapa de módulos

### Frontend

- Catálogo de productos
- Flujo de compra
- Integración con pagos
- Integración con transacciones
- Asistente IA

### Backend

- `catalog`
- `payments`
- `transactions`
- `customers`
- `deliveries`
- `assistant`
- `health`

## Modelo de datos

El diseño del modelo de datos solicitado por la prueba se documenta aquí:

- [Documentación técnica - Modelo de datos](./docs/02-documentacion-tecnica.md#modelo-de-datos)

Entidades principales:

- `Products`
- `Transactions`
- `Customers`
- `Deliveries`

Detalle de tablas DynamoDB:

### Products

- Tabla: `checkout-onboarding-api-<stage>-products`
- Partition key: `productId` (`S`)
- Campos principales:
  - `productId`
  - `name`
  - `description`
  - `features`
  - `priceInCents`
  - `currency`
  - `stock`

### Transactions

- Tabla: `checkout-onboarding-api-<stage>-transactions`
- Partition key: `transactionId` (`S`)
- Campos principales:
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
  - `wompiTransactionId`
  - `paymentMethodType`
  - `paymentStatusMessage`
  - `cardBrand`
  - `cardLastFour`
  - `createdAt`

### Customers

- Tabla: `checkout-onboarding-api-<stage>-customers`
- Partition key: `email` (`S`)
- Campos principales:
  - `customerId`
  - `fullName`
  - `email`
  - `phone`
  - `createdAt`

### Deliveries

- Tabla: `checkout-onboarding-api-<stage>-deliveries`
- Partition key: `transactionId` (`S`)
- Campos principales:
  - `deliveryId`
  - `transactionId`
  - `customerEmail`
  - `addressLine1`
  - `city`
  - `status`
  - `createdAt`

## Cobertura

### Frontend

- Statements: 92.84%
- Branches: 78.89%
- Functions: 92.36%
- Lines: 92.61%

### Backend

- Statements: 97.23%
- Branches: 88.49%
- Functions: 99.28%
- Lines: 97.23%

## Variables de entorno

### Frontend

Ver:

- [frontend/.env.example](./frontend/.env.example)

Variables principales:

- `VITE_API_BASE_URL`
- `VITE_WOMPI_BASE_URL`
- `VITE_WOMPI_PUBLIC_KEY`

### Backend

Ver:

- [backend/.env.example](./backend/.env.example)

Variables principales:

- `PORT`
- `AWS_REGION`
- `USE_DYNAMODB`
- `DYNAMODB_TABLE_PRODUCTS`
- `DYNAMODB_TABLE_TRANSACTIONS`
- `DYNAMODB_TABLE_CUSTOMERS`
- `DYNAMODB_TABLE_DELIVERIES`
- `WOMPI_BASE_URL`
- `WOMPI_PUBLIC_KEY`
- `WOMPI_PRIVATE_KEY`
- `WOMPI_INTEGRITY_SECRET`
- `WOMPI_EVENTS_SECRET`
- `CHECKOUT_BASE_FEE_IN_CENTS`
- `CHECKOUT_DELIVERY_FEE_IN_CENTS`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_MS`

## Imágenes de producto y activos visuales

Las imágenes del catálogo y los diagramas del proyecto se sirven desde:

- [frontend/public/product-images](./frontend/public/product-images)

## Comandos útiles

### Raíz

```bash
npm install
npm run build
npm run lint
```

### Frontend

```bash
cd frontend
npm run dev
npm run lint
npm run test -- --runInBand
npm run test:cov
npm run build
```

### Backend

```bash
cd backend
npm run start:dev
npm run lint
npm run build
npm run test -- --runInBand
npm run test:cov -- --runInBand
npm run seed:products -- --replace-existing --table-name checkout-onboarding-api-dev-products --region us-east-1
npm run deploy
```

## Despliegue y recursos publicados

### Frontend

- CloudFront: `https://dexepaqh217sp.cloudfront.net`
- S3 website: `http://checkout-onboarding-front-615910408457-7f3a9c.s3-website-us-east-1.amazonaws.com`

### Backend

- API: `https://0xcuoebg17.execute-api.us-east-1.amazonaws.com/api`
- La API expone headers de seguridad HTTP desde NestJS

## Navegación sugerida

Si quieres leer la solución como si fuera un documento por capítulos:

1. [Documentación del proyecto](./docs/04-documentacion-del-proyecto.md)
2. [Casos de uso](./docs/01-casos-de-uso.md)
3. [Arquitectura](./docs/03-arquitectura.md)
4. [Documentación técnica](./docs/02-documentacion-tecnica.md)
5. [Endpoints y contratos](./docs/07-endpoints-y-contratos.md)
6. [Guía de pruebas](./docs/05-guia-de-pruebas.md)
