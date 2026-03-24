# Postman

Archivos incluidos:

- `checkout-onboarding.postman_collection.json`
- `checkout-onboarding.local.postman_environment.json`
- `checkout-onboarding.aws-dev.postman_environment.json`

Orden recomendado:

1. Importa la coleccion y uno de los environments.
2. Ejecuta `Health`.
3. Ejecuta `List Products`.
4. Ejecuta `Get Checkout Config`.
5. Ejecuta `Get Acceptance Tokens`.
6. Ejecuta `Create Transaction`.
7. Ejecuta `Get Transaction`.
8. Si ya tienes un `cardToken` real de Wompi, ejecuta `Process Transaction Payment`.
9. Si quieres probar actualizacion interna sin esperar a Wompi, usa `Simulate Wompi Webhook`.

Notas:

- La coleccion guarda automaticamente `productId`, `productPriceInCents`, `transactionId` y `transactionReference`.
- `Get Checkout Config` actualiza `baseFeeInCents`, `deliveryFeeInCents` y recalcula `amountInCents`.
- `Process Transaction Payment` requiere un `cardToken` real de Wompi Sandbox.
- `Simulate Wompi Webhook` firma el payload con `wompiEventsSecret` usando un script de pre-request en Postman.
