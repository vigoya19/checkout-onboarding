# Endpoints y contratos

[Volver al indice principal](../README.md)

Todos los endpoints del backend usan el prefijo global:

```text
/api
```

## Convenciones generales

- `Content-Type: application/json`
- moneda soportada actualmente: `COP`
- los errores de validación devuelven `400 Bad Request`
- los recursos no encontrados devuelven `404 Not Found`
- los errores de integración devuelven `500` o `504` según el caso
- la API incluye headers de seguridad HTTP gestionados por `helmet`
- no se requieren headers extra del cliente para consumir estos endpoints

### Headers de seguridad esperados

Dependiendo del entorno y del adaptador HTTP, la respuesta puede incluir headers como:

- `x-dns-prefetch-control`
- `x-frame-options`
- `x-content-type-options`
- `referrer-policy`
- `cross-origin-opener-policy`

## GET /api/health

Valida que la API esté arriba.

### Response 200

```json
{
  "service": "checkout-onboarding-api",
  "status": "ok",
  "timestamp": "2026-03-24T02:00:00.000Z"
}
```

## GET /api/products

Lista el catálogo disponible para el flujo de compra.

### Response 200

```json
[
  {
    "id": "prod_ps5",
    "name": "PlayStation 5",
    "description": "Consola PS5 de nueva generacion con almacenamiento de 1 TB y soporte para juego en 4K.",
    "features": ["1 TB SSD", "Salida 4K", "Control DualSense"],
    "priceInCents": 299900000,
    "currency": "COP",
    "stock": 4
  }
]
```

## GET /api/payments/checkout-config

Devuelve la configuración de costos de la compra.

### Response 200

```json
{
  "baseFeeInCents": 390000,
  "deliveryFeeInCents": 990000
}
```

## GET /api/payments/acceptance-tokens

Consulta a Wompi Sandbox y devuelve los tokens de aceptación requeridos para crear una transacción.

### Response 200

```json
{
  "acceptanceToken": "acceptance-token",
  "acceptancePermalink": "https://...",
  "acceptPersonalAuthToken": "personal-auth-token",
  "acceptPersonalAuthPermalink": "https://..."
}
```

## POST /api/assistant

Consulta el asistente IA del resumen de compra. El backend puede enriquecer la pregunta con el producto real usando `productId`.

### Request body

```json
{
  "message": "¿Que incluye el total de la compra?",
  "productId": "prod_ps5",
  "currentStep": 1,
  "baseFeeInCents": 390000,
  "deliveryFeeInCents": 990000
}
```

### Campos

- `message`: obligatorio, máximo `500` caracteres
- `productId`: opcional, máximo `120` caracteres
- `currentStep`: opcional, entero mayor o igual a `1`
- `baseFeeInCents`: opcional, entero mayor o igual a `0`
- `deliveryFeeInCents`: opcional, entero mayor o igual a `0`

### Response 200

```json
{
  "answer": "El total estimado incluye el valor del producto, el fee base y el costo de entrega."
}
```

### Error típico 400

```json
{
  "message": ["message must be a string"],
  "error": "Bad Request",
  "statusCode": 400
}
```

## POST /api/transactions

Crea una transacción local en estado `PENDING` antes de pagar en Wompi.

### Request body

```json
{
  "productId": "prod_ps5",
  "customerEmail": "cliente@example.com",
  "customerName": "Andres Pineda",
  "customerPhone": "3001234567",
  "addressLine1": "Cra 10 #24-18",
  "city": "Barranquilla",
  "department": "Atlantico",
  "amountInCents": 301280000,
  "baseFeeInCents": 390000,
  "deliveryFeeInCents": 990000,
  "currency": "COP"
}
```

### Campos

- `productId`: obligatorio
- `customerEmail`: obligatorio, email válido
- `customerName`: obligatorio
- `customerPhone`: obligatorio
- `addressLine1`: obligatorio
- `city`: obligatorio
- `department`: obligatorio
- `amountInCents`: obligatorio, entero mayor o igual a `1`
- `baseFeeInCents`: obligatorio, entero mayor o igual a `0`
- `deliveryFeeInCents`: obligatorio, entero mayor o igual a `0`
- `currency`: obligatorio, actualmente `COP`

### Response 201 / 200

La API devuelve la transacción creada.

```json
{
  "transactionId": "16b38ca7-b91d-4670-976d-3c8dec7f3427",
  "reference": "16b38ca7-b91d-4670-976d-3c8dec7f3427",
  "productId": "prod_ps5",
  "customerName": "Andres Pineda",
  "customerEmail": "cliente@example.com",
  "customerPhone": "3001234567",
  "addressLine1": "Cra 10 #24-18",
  "city": "Barranquilla",
  "department": "Atlantico",
  "amountInCents": 301280000,
  "baseFeeInCents": 390000,
  "deliveryFeeInCents": 990000,
  "paymentStatus": "PENDING",
  "fulfillmentStatus": "NOT_STARTED",
  "createdAt": "2026-03-24T02:00:00.000Z",
  "wompiTransactionId": null,
  "paymentMethodType": null,
  "paymentStatusMessage": null,
  "cardBrand": null,
  "cardLastFour": null
}
```

### Errores típicos

- `404`: el producto no existe
- `400`: el producto no tiene stock

## GET /api/transactions/:transactionId

Consulta una transacción local. Si sigue `PENDING` y ya tiene `wompiTransactionId`, el backend intenta sincronizar el estado con Wompi.

### Response 200

```json
{
  "transactionId": "16b38ca7-b91d-4670-976d-3c8dec7f3427",
  "reference": "16b38ca7-b91d-4670-976d-3c8dec7f3427",
  "productId": "prod_ps5",
  "customerName": "Andres Pineda",
  "customerEmail": "cliente@example.com",
  "customerPhone": "3001234567",
  "addressLine1": "Cra 10 #24-18",
  "city": "Barranquilla",
  "department": "Atlantico",
  "amountInCents": 301280000,
  "baseFeeInCents": 390000,
  "deliveryFeeInCents": 990000,
  "paymentStatus": "APPROVED",
  "fulfillmentStatus": "COMPLETED",
  "createdAt": "2026-03-24T02:00:00.000Z",
  "wompiTransactionId": "wompi-tx-123",
  "paymentMethodType": "CARD",
  "paymentStatusMessage": "Transaction status updated by Wompi",
  "cardBrand": "VISA",
  "cardLastFour": "4242"
}
```

### Error típico 404

```json
{
  "message": "Transaction 16b38ca7-b91d-4670-976d-3c8dec7f3427 was not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## POST /api/transactions/:transactionId/pay

Procesa el pago de una transacción local usando Wompi Sandbox.

### Request body

```json
{
  "cardToken": "tok_test_123",
  "acceptanceToken": "acceptance-token",
  "acceptPersonalAuthToken": "personal-auth-token",
  "installments": 1
}
```

### Campos

- `cardToken`: obligatorio
- `acceptanceToken`: obligatorio
- `acceptPersonalAuthToken`: opcional
- `customerIp`: opcional
  - si no se envía, el backend intenta resolverla desde el request
- `installments`: obligatorio, entero entre `1` y `36`

### Response 200

Devuelve la transacción actualizada con el resultado de pago local/Wompi.

```json
{
  "transactionId": "16b38ca7-b91d-4670-976d-3c8dec7f3427",
  "reference": "16b38ca7-b91d-4670-976d-3c8dec7f3427",
  "paymentStatus": "APPROVED",
  "fulfillmentStatus": "NOT_STARTED",
  "wompiTransactionId": "wompi-tx-123",
  "paymentMethodType": "CARD",
  "paymentStatusMessage": "Transaction status updated by Wompi",
  "cardBrand": "VISA",
  "cardLastFour": "4242"
}
```

## POST /api/webhooks/wompi

Recibe eventos de Wompi para sincronizar el estado de una transacción.

### Request body

```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "wompi-tx-123",
      "amount_in_cents": 301280000,
      "reference": "16b38ca7-b91d-4670-976d-3c8dec7f3427",
      "customer_email": "cliente@example.com",
      "currency": "COP",
      "payment_method_type": "CARD",
      "status": "APPROVED"
    }
  },
  "signature": {
    "properties": ["transaction.id", "transaction.status", "transaction.reference"],
    "checksum": "signature-checksum"
  },
  "timestamp": 1774320000
}
```

### Response 200

```json
{
  "received": true
}
```

### Notas

- la firma se valida con `WOMPI_EVENTS_SECRET`
- si la firma no es válida, la API rechaza el webhook
- el flujo soportado esperado es `transaction.updated`

## Estados de negocio devueltos por transactions

### PaymentStatus

- `PENDING`
- `APPROVED`
- `DECLINED`
- `VOIDED`
- `ERROR`

### FulfillmentStatus

- `NOT_STARTED`
- `COMPLETED`
- `FAILED`

---

[Volver al indice principal](../README.md)
