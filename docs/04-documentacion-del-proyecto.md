# Documentacion del proyecto

## Resumen

Este proyecto implementa un checkout onboarding para compra de consolas usando Wompi Sandbox. La solucion cumple el flujo funcional principal del reto:

- catalogo con productos dummy
- compra de un producto
- captura de tarjeta y entrega
- resumen del pago
- resultado final
- retorno al catalogo con stock actualizado

## Alcance actual

### Implementado

- lista de productos desde backend
- producto seleccionado en el hero y en el resumen
- formulario de tarjeta y datos de entrega
- aceptacion de terminos y tratamiento de datos
- tokenizacion real contra Wompi Sandbox
- creacion de transaccion local
- cobro real desde backend
- polling del estado de la transaccion
- webhook de Wompi
- fulfillment con actualizacion de stock
- pruebas unitarias frontend y backend

### Fuera de alcance

- carrito multi-producto
- panel administrativo
- autenticacion de usuarios
- emails o notificaciones

## Requisitos del reto cubiertos

- frontend SPA en React
- Redux como estado del flujo
- mobile first y responsive
- uso de flexbox para layout
- backend en NestJS
- logica fuera de controllers
- Wompi Sandbox
- productos dummy sembrados
- stock, transactions, customers y deliveries
- despliegue backend en AWS con IaC
- Postman como artefacto de prueba
- cobertura mayor a 80% en frontend y backend

## Artefactos principales

- Codigo frontend en [frontend](c:/Users/quich/Documents/PruebaWompi/frontend)
- Codigo backend en [backend](c:/Users/quich/Documents/PruebaWompi/backend)
- Coleccion Postman en [postman](c:/Users/quich/Documents/PruebaWompi/postman)
- Documentacion en [docs](c:/Users/quich/Documents/PruebaWompi/docs)

## Scripts importantes

### Raiz

```bash
npm run build
npm run lint
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run test:cov
```

### Backend

```bash
cd backend
npm run start:dev
npm run seed:products -- --replace-existing --table-name checkout-onboarding-api-dev-products --region us-east-1
npm run test:cov -- --runInBand
npm run deploy
```

## Riesgos o puntos a tener en cuenta

- si cambias backend, debes volver a desplegar Lambda
- si cambias `serverless.yml`, debes volver a desplegar infraestructura
- para pruebas reales en Wompi, asegurate de usar llaves sandbox
- el seed puede reemplazar el catalogo si ejecutas `--replace-existing`

## Estructura de entrega recomendada

1. Repositorio publico
2. README raiz
3. Documentacion en `docs/`
4. Coleccion Postman
5. URL del backend desplegado
6. URL del frontend desplegado
