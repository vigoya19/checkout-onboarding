# Prompt para diagrama de arquitectura

Usa este prompt en Lucidchart AI o en la herramienta de diagramacion que prefieras:

```text
Genera un diagrama de arquitectura cloud y de flujo para un proyecto llamado "Checkout Onboarding".

Contexto general:
- Es una aplicacion full stack para comprar una consola con tarjeta de credito.
- El frontend es una SPA en React con Redux Toolkit.
- El backend es una API en NestJS desplegada como una sola AWS Lambda.
- La infraestructura del backend esta definida con Serverless Framework.
- La base de datos es DynamoDB.
- La pasarela de pago es Wompi Sandbox.

Componentes que deben aparecer:
1. Usuario / Navegador
2. Frontend React SPA
3. Redux Toolkit + localStorage
4. API Gateway HTTP API
5. AWS Lambda con NestJS
6. DynamoDB Products
7. DynamoDB Transactions
8. DynamoDB Customers
9. DynamoDB Deliveries
10. Wompi Sandbox API
11. Wompi Webhook
12. CloudWatch Logs

Relaciones y flujo:
- El usuario entra al frontend y consulta el catalogo.
- El frontend llama GET /api/products en el backend.
- El backend consulta DynamoDB Products.
- El usuario selecciona un producto e inicia el checkout.
- El frontend solicita GET /api/payments/acceptance-tokens al backend.
- El backend consulta Wompi Sandbox para obtener acceptance tokens.
- El frontend tokeniza la tarjeta directamente contra Wompi usando la public key.
- El frontend crea una transaccion local con POST /api/transactions.
- El backend guarda la transaccion en DynamoDB Transactions con estado PENDING.
- El frontend llama POST /api/transactions/:transactionId/pay.
- El backend usa la private key para crear la transaccion en Wompi Sandbox.
- Wompi responde con el estado inicial del pago.
- Si el estado queda PENDING, el frontend consulta GET /api/transactions/:transactionId hasta obtener estado final.
- Wompi puede enviar POST /api/webhooks/wompi al backend para actualizar el estado.
- Cuando el pago queda APPROVED, el backend:
  - crea o reutiliza un registro en Customers
  - crea un registro en Deliveries
  - descuenta stock en Products
  - actualiza la transaccion con fulfillmentStatus COMPLETED
- El frontend muestra pantalla final y vuelve al catalogo con stock actualizado.

Estilo visual solicitado:
- Diagrama moderno, profesional y limpio.
- Separar por capas: Client, AWS, External Provider, Data.
- Incluir flechas con etiquetas cortas como "GET products", "Create transaction", "Tokenize card", "Webhook update", "Decrease stock".
- Resaltar en otro color el flujo critico de pago.
- Mostrar que Redux + localStorage soportan persistencia del avance del checkout.

Entregables del diagrama:
1. Un diagrama de componentes de alto nivel.
2. Un diagrama de secuencia simplificado del flujo de pago.
```
