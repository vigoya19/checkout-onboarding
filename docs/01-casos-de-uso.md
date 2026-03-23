# Casos de uso

## Objetivo

Soportar la compra de una consola con tarjeta de credito, integrando Wompi Sandbox, calculo de fees, actualizacion de stock y persistencia del estado de la transaccion.

## Actores

- Cliente final
- Backend del checkout
- Wompi Sandbox

## Caso de uso 1: Consultar catalogo

### Descripcion

El cliente entra a la aplicacion y visualiza las consolas disponibles con precio y stock.

### Entrada

- Request `GET /api/products`

### Salida

- Lista de productos con `id`, `name`, `description`, `priceInCents`, `currency`, `stock`

## Caso de uso 2: Seleccionar producto

### Descripcion

El cliente escoge una consola y arranca el flujo de checkout.

### Resultado

- Redux guarda el producto seleccionado
- El flujo pasa al paso de tarjeta y entrega

## Caso de uso 3: Capturar datos de pago y entrega

### Descripcion

El cliente diligencia:

- nombre del titular
- numero de tarjeta
- fecha de expiracion
- cvc
- nombre del cliente
- email
- telefono
- direccion
- ciudad
- departamento

Ademas acepta los terminos de Wompi y, si aplica, la autorizacion de tratamiento de datos.

## Caso de uso 4: Consultar tokens de aceptacion

### Descripcion

Antes de pagar, el frontend consulta al backend los tokens de aceptacion de Wompi.

### Entrada

- Request `GET /api/payments/acceptance-tokens`

### Salida

- `acceptanceToken`
- `acceptancePermalink`
- `acceptPersonalAuthToken`
- `acceptPersonalAuthPermalink`

## Caso de uso 5: Crear transaccion local

### Descripcion

El frontend crea una transaccion local con estado inicial antes de disparar el pago.

### Entrada

- Request `POST /api/transactions`
- producto
- customer
- delivery
- `amountInCents`
- `baseFeeInCents`
- `deliveryFeeInCents`

### Salida

- `transactionId`
- `reference`
- estado `PENDING`

## Caso de uso 6: Procesar pago en Wompi

### Descripcion

El frontend tokeniza la tarjeta con la llave publica y envia el `cardToken` al backend. El backend usa la llave privada para crear la transaccion en Wompi.

### Entrada

- Request `POST /api/transactions/:transactionId/pay`
- `cardToken`
- `acceptanceToken`
- `acceptPersonalAuthToken`
- `installments`
- `customerIp`

### Salida

- Estado del pago
- referencia local
- referencia de Wompi

## Caso de uso 7: Consultar estado de la transaccion

### Descripcion

Si el pago no queda final inmediatamente, el frontend consulta el backend hasta obtener un estado definitivo.

### Entrada

- Request `GET /api/transactions/:transactionId`

### Salida

- `paymentStatus`
- `fulfillmentStatus`
- `paymentStatusMessage`

## Caso de uso 8: Aplicar fulfillment cuando el pago es aprobado

### Descripcion

Cuando la transaccion queda `APPROVED`, el backend:

- crea o reutiliza el customer
- crea la entrega
- descuenta el stock
- marca fulfillment

## Caso de uso 9: Recibir webhook de Wompi

### Descripcion

Wompi puede actualizar el estado final por webhook.

### Entrada

- Request `POST /api/webhooks/wompi`

### Salida

- actualizacion de estado
- posible fulfillment

## Caso de uso 10: Volver al catalogo con stock actualizado

### Descripcion

Despues del estado final, el usuario vuelve al catalogo y la app refresca los productos para mostrar el stock real.
