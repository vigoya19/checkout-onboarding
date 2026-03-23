# Documentacion de arquitectura

## Estilo arquitectonico

La solucion usa un monolito modular serverless:

- frontend SPA desacoplado
- backend HTTP unico sobre NestJS
- persistencia DynamoDB
- pagos integrados con Wompi Sandbox

No se usan microservicios ni colas para este alcance.

## Componentes

### Frontend

- React
- Redux Toolkit
- `localStorage` para persistencia del flujo
- cliente HTTP para backend
- cliente HTTP para tokenizacion contra Wompi

### Backend

- Lambda Node.js 20
- API Gateway HTTP API
- NestJS como adaptador HTTP unico
- modulo de pagos con gateway de Wompi
- modulos de `catalog`, `transactions`, `customers`, `deliveries`

### Persistencia

- DynamoDB `Products`
- DynamoDB `Transactions`
- DynamoDB `Customers`
- DynamoDB `Deliveries`

### Infraestructura AWS

- AWS Lambda
- API Gateway HTTP API
- DynamoDB
- CloudWatch Logs
- Serverless Framework

## Flujo de alto nivel

```text
React SPA
  -> API Gateway
    -> Lambda (NestJS)
      -> DynamoDB
      -> Wompi Sandbox
```

## Flujo de pago

```text
1. Frontend consulta productos
2. Usuario selecciona consola
3. Frontend consulta acceptance tokens
4. Frontend tokeniza la tarjeta con Wompi
5. Frontend crea la transaccion local en backend
6. Backend crea el pago en Wompi
7. Backend sincroniza estado
8. Si APPROVED:
   - crea/reutiliza customer
   - crea delivery
   - descuenta stock
9. Frontend muestra estado final
10. Frontend vuelve al catalogo y refresca stock
```

## Decisiones importantes

### Persistencia del avance

Se resolvio con `Redux + localStorage` en frontend. Se elimino `checkout session` porque ya no aportaba al flujo real.

### Integracion con Wompi

- Frontend usa `public key`
- Backend usa `private key`
- Webhook usa `events secret`
- Firma usa `integrity secret`

### Manejo de estados

#### PaymentStatus

- `PENDING`
- `APPROVED`
- `DECLINED`
- `VOIDED`
- `ERROR`

#### FulfillmentStatus

- `NOT_STARTED`
- `COMPLETED`
- `FAILED`

## Despliegue backend

La infraestructura del backend esta definida en:

- [serverless.yml](c:/Users/quich/Documents/PruebaWompi/backend/serverless.yml)

Configuracion principal:

- runtime `nodejs20.x`
- una sola Lambda HTTP
- tablas Dynamo por modulo
- CORS habilitado

## Ventajas de esta arquitectura

- sencilla de explicar y operar
- cumple el reto sin sobre-ingenieria
- desacopla frontend, backend y proveedor de pago
- permite pruebas unitarias por modulo
- soporta stock y fulfillment reales

## Limitaciones deliberadas

- no hay cola ni procesamiento asincrono con SQS
- no hay microservicios
- no hay Swagger; se entrega Postman
- el frontend se deja listo para despliegue, pero la infraestructura definida en codigo es principalmente para backend
