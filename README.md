# Pixel Vault

Catálogo editorial de videojuegos con diseño adaptable, búsqueda, filtros por género, ordenación, fichas y gestión de títulos.

## Aplicación

- Interfaz en español, diseño oscuro e ilustraciones originales.
- Login validado en servidor y sesión de dos horas en cookie HttpOnly, Secure y SameSite=Lax.
- Alta, edición y eliminación con autorización del servidor y comprobación de origen.
- Base de datos persistente Cloudflare D1 compartida entre navegadores.
- Consultas SQL parametrizadas y contenido escapado al mostrarlo.

## Uso local

Requiere Node.js 24 o superior. No necesita instalar dependencias.

```sh
npm run dev
```

Abre http://localhost:4173. La vista previa usa SQLite en memoria y se restablece al reiniciar; el alojamiento utiliza D1 persistente. Las cookies Secure funcionan con localhost en navegadores modernos; en el alojamiento se utiliza HTTPS.

```sh
npm test
npm run build
npm run validate
```

## Cuenta de demostración

Usuario: `alex` · Contraseña: `Arcade2026!`

Todos los datos y credenciales son ficticios. La cuenta compartida permite modificar un catálogo de demostración; no se deben almacenar datos privados. Las puntuaciones son una selección editorial ilustrativa.

Este proyecto acompaña una práctica académica autorizada sobre su propia instancia. La contraseña de demostración está incluida de forma deliberada en los diccionarios. El login no incorpora bloqueo de cuenta, limitación de intentos ni MFA, por lo que esta configuración no debe usarse para cuentas reales. El hash SHA-256 fijo sirve para esta demostración; una aplicación de producción debe usar un derivador de contraseñas con sal y factor de trabajo, credenciales privadas y limitación de intentos. La presentación pública es la de un catálogo de videojuegos.

## Estructura

- `worker/app.js`: rutas HTTP y operaciones con D1.
- `worker/page.js`: interfaz y lógica del navegador.
- `assets/`: ilustraciones originales servidas por la aplicación.
- `drizzle/`: migración inicial del esquema.
- `scripts/`: build, vista previa y pruebas.
- `usuarios.txt`, `contraseñas.txt`: diccionarios pequeños con datos ficticios.

El build crea un Worker ESM autocontenido en `dist/server/index.js`. La configuración de alojamiento se conserva en `.openai/hosting.json`. El repositorio no contiene tokens de GitHub ni credenciales de infraestructura.

## Autoría visual

Los nombres de juegos pertenecen a sus respectivos titulares. Las ilustraciones son originales generadas para este catálogo, no portadas oficiales.
