# Plan: Implementar Panel de Administración

**Creado:** 2026-04-29
**Estado:** Borrador
**Pedido:** Implementar la parte del administrador (Dashboard, Usuarios, Analíticas) migrando la lógica desde `platform-admin.jsx`.

---

## Descripción General

### Qué Logra Este Plan

Este plan integra el Panel de Administración profesional en la aplicación Next.js. Permite a los usuarios con rol `admin` o `supervisor` visualizar estadísticas de rendimiento, gestionar el progreso de los vendedores y administrar la lista de usuarios.

### Por Qué Importa

El administrador necesita visibilidad sobre el progreso del equipo para certificar a los vendedores. Centralizar esta gestión en la app Next.js (en lugar de archivos sueltos) mejora la seguridad y la experiencia de usuario.

---

## Estado Actual

### Estructura Existente Relevante

- `salidas/app-capacitacion-gral/platform-admin.jsx`: Contiene la lógica legacy de administración (React puro).
- `salidas/app-capacitacion-gral/app/page.tsx`: Punto de entrada que actualmente no maneja la vista de administración.
- `salidas/app-capacitacion-gral/lib/data/users.ts`: Define los usuarios y sus roles.

### Brechas o Problemas que se Abordan

- ❌ **Falta de Interfaz Admin**: Aunque existen usuarios admin, no tienen una interfaz dedicada en el proyecto Next.js.
- ❌ **Fragmentación**: La lógica de administración está en archivos `.jsx` fuera de la estructura de la aplicación.

---

## Cambios Propuestos

### Resumen de Cambios

- Crear una estructura de sub-componentes para el panel de administración en `components/admin/`.
- Implementar un sistema de navegación interna para el panel admin (Dashboard, Usuarios, Analíticas).
- Conectar el panel con los datos de `localStorage` (donde se guardan resultados y progreso actualmente).
- Actualizar el enrutador principal en `app/page.tsx` para mostrar el panel al loguearse como admin.

### Nuevos Archivos a Crear

| Ruta del Archivo  | Propósito                          |
| ----------------- | ---------------------------------- |
| `components/AdminPanel.tsx` | Contenedor principal del panel administrativo. |
| `components/admin/Sidebar.tsx` | Barra lateral de navegación con perfiles de rol. |
| `components/admin/Dashboard.tsx` | Vista de resumen con estadísticas clave. |
| `components/admin/Users.tsx` | Gestión de lista de vendedores. |
| `components/admin/Analytics.tsx` | Gráficos y tablas detalladas de resultados. |

### Archivos a Modificar

| Ruta del Archivo  | Cambios                      |
| ----------------- | ---------------------------- |
| `app/page.tsx` | Agregar el estado `view: 'admin'` y renderizar `AdminPanel`. |
| `lib/types/index.ts` | Definir tipos para resultados y estadísticas si no están. |

---

## Decisiones de Diseño

### Decisiones Clave Tomadas

1. **Migración de Estilos**: Se usarán las clases de Tailwind 4 para recrear el diseño "premium" (dark sidebar, glassmorphism) visto en los archivos legacy.
2. **Gráficos SVG**: Reutilizaré la lógica de `BarChart` de `platform-admin.jsx` pero convertida a un componente React funcional y tipado.
3. **Acceso**: El panel detectará el rol del usuario para mostrar/ocultar secciones (ej. un Supervisor no ve el Generador IA o gestión de otros admins).

---

## Tareas Paso a Paso

### Paso 1: Definir Componentes de UI Admin

**Acciones:**

- Crear `components/admin/Sidebar.tsx` con soporte para selección de secciones y logout.
- Crear `components/admin/Dashboard.tsx` con las tarjetas de métricas.

**Archivos afectados:**
- `salidas/app-capacitacion-gral/components/admin/Sidebar.tsx`
- `salidas/app-capacitacion-gral/components/admin/Dashboard.tsx`

---

### Paso 2: Implementar Vistas de Datos (Usuarios y Analíticas)

**Acciones:**

- Crear `components/admin/Users.tsx` que liste los usuarios de `lib/data/users.ts` y permita filtrar.
- Crear `components/admin/Analytics.tsx` con el `BarChart` y la tabla de resultados de evaluaciones.

**Archivos afectados:**
- `salidas/app-capacitacion-gral/components/admin/Users.tsx`
- `salidas/app-capacitacion-gral/components/admin/Analytics.tsx`

---

### Paso 3: Integración Final

**Acciones:**

- Crear `components/AdminPanel.tsx` que coordine la navegación entre secciones.
- Modificar `app/page.tsx` para que, al detectar un usuario con `role === 'admin'`, la vista inicial después del login sea `'admin'`.

**Archivos afectados:**
- `salidas/app-capacitacion-gral/components/AdminPanel.tsx`
- `salidas/app-capacitacion-gral/app/page.tsx`

---

## Lista de Validación

- [ ] Un usuario admin entra directamente al panel después del login.
- [ ] La barra lateral permite cambiar entre Dashboard, Usuarios y Analíticas.
- [ ] Las estadísticas del Dashboard reflejan los datos reales (o mocks iniciales).
- [ ] El botón de logout funciona y limpia la sesión.

---

## Criterios de Éxito

1. Existe una ruta o vista de administración funcional.
2. El diseño es consistente con la estética premium del resto de la app.
3. Se mantiene la modularidad para futura integración con Notion API.
