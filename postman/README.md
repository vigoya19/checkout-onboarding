# Postman

[Volver al indice principal](../README.md)

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
6. Si quieres probar el asistente, ejecuta `Ask Assistant`.
7. Ejecuta `Create Transaction`.
8. Ejecuta `Get Transaction`.
9. Si ya tienes un `cardToken` real de Wompi, ejecuta `Process Transaction Payment`.
10. Si quieres probar actualizacion interna sin esperar a Wompi, usa `Simulate Wompi Webhook`.

Notas:

- La coleccion guarda automaticamente `productId`, `productPriceInCents`, `transactionId` y `transactionReference`.
- `Get Checkout Config` actualiza `baseFeeInCents`, `deliveryFeeInCents` y recalcula `amountInCents`.
- `Process Transaction Payment` requiere un `cardToken` real de Wompi Sandbox.
- `Simulate Wompi Webhook` firma el payload con `wompiEventsSecret` usando un script de pre-request en Postman.
- No necesitas agregar headers manuales nuevos en Postman por la capa de seguridad; los headers de seguridad salen en la respuesta del backend.

---

[Volver al indice principal](../README.md)
