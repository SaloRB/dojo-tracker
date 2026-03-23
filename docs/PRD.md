# PRD: Sistema de registro de asistencias (Dojo Tracker)

> Issue: https://github.com/SaloRB/dojo-tracker/issues/1

## Problem Statement

Como maestro de jiu jitsu con ~200 alumnos, necesito una forma rápida y confiable de registrar la asistencia y el balance de clases de cada alumno. Actualmente no existe un sistema centralizado que me permita saber de un vistazo quién puede tomar clase y quién no, ni llevar un historial de movimientos por alumno.

## Solution

Una PWA (Progressive Web App) offline-first que funcione desde el navegador del teléfono o computadora, sin necesidad de internet. La pantalla principal muestra la lista de alumnos con su balance de clases disponibles y botones de acción rápida. El sistema previene saldos negativos y guarda un historial completo de cada movimiento.

## User Stories

1. Como maestro, quiero ver la lista de todos mis alumnos activos en la pantalla principal, para tener un panorama rápido del estado de cada uno.
2. Como maestro, quiero buscar alumnos por nombre, para encontrarlos rápidamente entre 200 registros.
3. Como maestro, quiero ordenar la lista alfabéticamente o por mayor balance disponible, para adaptarme a diferentes situaciones.
4. Como maestro, quiero ver el número exacto de clases disponibles de cada alumno junto con un indicador visual (verde/rojo), para saber de un vistazo quién puede tomar clase.
5. Como maestro, quiero presionar un botón -1 junto a un alumno antes de iniciar la clase, para registrar su asistencia y descontar una clase de su balance.
6. Como maestro, quiero que el sistema impida que un alumno llegue a saldo negativo, para mantener el control de pagos.
7. Como maestro, quiero presionar un botón +1 junto a un alumno, para registrar que pagó una clase individual.
8. Como maestro, quiero presionar un botón +10 junto a un alumno, para registrar que pagó un paquete de 10 clases.
9. Como maestro, quiero que cada operación de +1, +10 y -1 quede registrada automáticamente con fecha y hora, para tener trazabilidad completa.
10. Como maestro, quiero ver el historial de movimientos de un alumno específico, para revisar su actividad y pagos anteriores.
11. Como maestro, quiero consultar el historial general por rango de fechas, para revisar la actividad del dojo en un período determinado.
12. Como maestro, quiero agregar nuevos alumnos con solo su nombre, para dar de alta rápidamente a alguien nuevo.
13. Como maestro, quiero editar el nombre de un alumno, para corregir errores tipográficos.
14. Como maestro, quiero archivar a un alumno que dejó de asistir, para que no aparezca en la lista principal sin perder su historial.
15. Como maestro, quiero desarchivar a un alumno previamente archivado, para reactivarlo sin crear un nuevo registro.
16. Como maestro, quiero ver la lista de alumnos archivados, para tener visibilidad sobre quiénes han dejado de asistir.
17. Como maestro, quiero exportar todos los datos a un archivo JSON, para tener un respaldo en caso de cambiar de dispositivo o perder los datos.
18. Como maestro, quiero que la app funcione completamente sin conexión a internet, para poder usarla en el dojo aunque no haya WiFi.
19. Como maestro, quiero instalar la app en mi dispositivo como una PWA, para acceder a ella fácilmente desde la pantalla de inicio.
20. Como maestro, quiero que los alumnos con balance 0 estén visualmente diferenciados (indicador rojo), para identificarlos de inmediato.

## Implementation Decisions

### Módulos a construir

**1. Capa de datos local (IndexedDB vía Dexie.js)**
- Almacenamiento offline-first, todo en el dispositivo del usuario, sin backend.
- Tabla `students`: id, nombre, balance (entero ≥ 0), estado (activo/archivado), fechaCreación.
- Tabla `movements`: id, studentId, tipo (+1, +10, -1), fecha, balanceAntes, balanceDespués.

**2. Módulo de gestión de alumnos**
- Operaciones: crear alumno, editar nombre, archivar, desarchivar, listar activos, listar archivados.
- Interfaz simple y desacoplada de la UI.

**3. Módulo de balance**
- Aplica deltas (+1, +10, -1) con validación: balance nunca puede ser menor a 0.
- Cada operación exitosa genera automáticamente un registro en la tabla de movimientos.
- Interfaz: `adjustBalance(studentId, delta)` → retorna error si el resultado sería negativo.

**4. Módulo de historial**
- Consulta de movimientos por alumno individual.
- Consulta de movimientos por rango de fechas (todos los alumnos).

**5. Módulo de exportación/respaldo**
- Exporta el contenido completo de ambas tablas a un archivo `.json` descargable.

**6. UI — Pantalla principal (lista de alumnos)**
- Buscador de nombre con filtrado en tiempo real.
- Ordenamiento dinámico: alfabético o por mayor balance.
- Por cada alumno: nombre, balance numérico, indicador visual (verde si balance > 0, rojo si balance = 0), botones -1 / +1 / +10.
- Botón -1 deshabilitado visualmente si el balance es 0.

**7. UI — Gestión de alumnos**
- Formulario de alta (solo nombre).
- Opción de editar nombre desde el perfil del alumno.
- Opción de archivar/desarchivar.
- Vista de historial de movimientos por alumno.

**8. UI — Historial general**
- Selector de rango de fechas.
- Lista de movimientos ordenados cronológicamente.

**9. Shell PWA**
- Service worker para soporte offline completo.
- Web App Manifest para instalación en dispositivo.

### Decisiones arquitectónicas
- Sin backend: toda la lógica y datos residen en el cliente.
- Stack: React + Vite + Dexie.js + Tailwind CSS.
- Un solo usuario (maestro), sin autenticación.

## Testing Decisions

Un buen test valida comportamiento observable desde fuera del módulo, no detalles de implementación internos.

**Módulos a testear:**

- **Módulo de balance**: es el núcleo de negocio y el más crítico.
  - Verificar que +1 y +10 incrementan correctamente el balance.
  - Verificar que -1 decrementa el balance.
  - Verificar que -1 con balance = 0 retorna error y no modifica el registro.
  - Verificar que cada operación exitosa genera un registro en movimientos con los campos correctos.

- **Módulo de historial**:
  - Verificar que los movimientos se retornan correctamente por alumno.
  - Verificar que el filtro por rango de fechas incluye y excluye los registros correctamente.

- **Módulo de gestión de alumnos**:
  - Verificar que archivar un alumno lo excluye de la lista activa.
  - Verificar que desarchivar lo devuelve a la lista activa sin crear duplicados.

Los tests deben correr contra una instancia real de Dexie en memoria (fake-indexeddb), no con mocks.

## Out of Scope

- Registro de montos o métodos de pago.
- Múltiples instructores o roles de usuario.
- Autenticación o control de acceso.
- Notificaciones o recordatorios a alumnos.
- Diferentes tarifas o tipos de membresía.
- Sincronización con la nube o múltiples dispositivos.
- Grupos o niveles de clase (gi, no-gi, etc.).
- Estadísticas avanzadas o reportes gráficos.
- Importación de datos desde otros sistemas.

## Further Notes

- La app debe ser usable en móvil con una mano, priorizando botones grandes y fáciles de presionar.
- El respaldo JSON debe ser descargable manualmente; no hay sincronización automática.
- El historial de movimientos se guarda indefinidamente (sin expiración).
- Con ~200 alumnos y uso diario, el volumen de datos en IndexedDB se mantendrá muy manejable.
