# Dojo Tracker

App PWA para dojos y estudios marciales. Permite registrar alumnos, controlar su saldo de clases y consultar el historial de movimientos — todo desde el celular, sin conexión a internet.

## Funcionalidades

### Alumnos
- Agregar, editar y archivar alumnos
- Ver lista de alumnos activos y archivados
- Desarchivar alumnos sin perder su historial

### Balance de clases
- Registrar asistencia (−1 clase)
- Registrar pagos (+1 o +10 clases)
- El sistema impide que el saldo quede negativo

### Historial
- Ver todos los movimientos de un alumno (desde su perfil)
- Consultar el historial general filtrando por rango de fechas
- Cada movimiento registra fecha, tipo, saldo anterior y saldo nuevo

### Backup
- Exportar todos los datos a un archivo JSON desde el menú de la app

## Stack

- **React 19** + Vite
- **Dexie** (IndexedDB) — base de datos local en el navegador
- **Tailwind CSS 4**
- **PWA** — instalable en iOS/Android, funciona sin conexión

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # correr tests (Vitest + fake-indexeddb)
npm run build    # build de producción
```

## Tests

Los tests corren contra una instancia real de Dexie en memoria usando `fake-indexeddb`. No hay mocks — cada test verifica comportamiento real a través de la interfaz pública de `src/db.js`.

```bash
npm test
```

## Despliegue

La app se despliega automáticamente en GitHub Pages al hacer push a `main`.
