# Arquitectura Frontend Mobile — RentaMovil

# Introducción

La aplicación móvil **RentaMovil** está desarrollada con:

* **React Native**
* **Expo**
* **TypeScript**
* **Expo Router**

La arquitectura implementada combina dos enfoques principales:

## 1. Feature-Based Architecture

Organiza el proyecto por funcionalidades o módulos.

Ejemplo:

* auth
* home
* vehicles

Cada módulo contiene todo lo relacionado con esa funcionalidad:

* componentes
* hooks
* páginas
* servicios

---

## 2. Component-Driven Architecture

La interfaz se construye usando componentes reutilizables y desacoplados.

Esto permite:

* reutilización
* escalabilidad
* mantenimiento sencillo
* trabajo colaborativo

---

# Objetivos de la Arquitectura

Esta arquitectura fue diseñada para:

* Escalar fácilmente
* Mantener el código organizado
* Separar responsabilidades
* Facilitar el trabajo en equipo
* Reutilizar componentes
* Preparar el frontend para integrarse con un backend real
* Evitar código duplicado

---

# Estructura General del Proyecto

```txt
rentaMovil/
│
├── assets/
├── components/
├── src/
├── app.json
├── package.json
├── tsconfig.json
└── expo-env.d.ts
```

---

# assets/

Contiene todos los archivos estáticos globales del proyecto.

```txt
assets/
├── fonts/
└── images/
```

---

## Fuentes tipográficas

Las fuentes Inter y Poppins se importan desde los paquetes `@expo-google-fonts`
y se cargan mediante:

```tsx
useFonts()
```

en:

```txt
src/app/_layout.tsx
```

---

## assets/images/

```txt
images/
├── adaptive-icon.png
├── favicon.png
├── icon.png
└── splash-icon.png
```

Contiene:

* icono principal de la app
* splash screen
* favicon web
* adaptive icon Android

Estos recursos son usados automáticamente por Expo mediante `app.json`.

---

# components/

```txt
components/
└── __tests__/
```

Esta carpeta proviene del template inicial de Expo.

Actualmente no contiene lógica funcional importante.

Se conserva temporalmente como referencia o plantilla.

Posteriormente puede eliminarse cuando el proyecto esté completamente migrado.

---

# src/

La carpeta `src` contiene toda la lógica principal de la aplicación.

```txt
src/
├── app/
├── constants/
├── features/
├── shared/
├── state/
├── styles/
└── types/
```

---

# src/app/

Esta carpeta pertenece al sistema de navegación de Expo Router.

Aquí NO se coloca lógica de negocio.

Su función es únicamente manejar:

* rutas
* navegación
* stacks
* tabs
* layouts

Expo Router genera automáticamente las rutas basándose en esta estructura.

---

# src/app/_layout.tsx

Es el layout raíz de toda la aplicación.

Cumple funciones similares a un `App.tsx`.

Aquí normalmente se configura:

* navegación principal
* providers
* temas
* carga de fuentes
* splash screen
* configuración global

Ejemplo:

```tsx
<ThemeProvider>
```

---

# src/app/+not-found.tsx

Pantalla mostrada cuando una ruta no existe.

Equivale a un:

```txt
404 Not Found
```

---

# src/app/modal.tsx

Pantalla modal global.

Expo Router permite mostrar pantallas tipo modal usando:

```tsx
presentation: 'modal'
```

---

# src/app/auth/

```txt
auth/
├── login.tsx
└── _layout.tsx
```

Contiene únicamente las rutas relacionadas con autenticación.

Importante:

Aquí NO se implementa la lógica de login.

Solo se conectan las páginas reales.

---

## login.tsx

Este archivo conecta la navegación con la página real del módulo.

Ejemplo:

```tsx
import LoginPage from '@/features/auth/pages/LoginPage'

export default function LoginRoute() {
  return <LoginPage />
}
```

Esto permite desacoplar:

* navegación
* UI
* lógica de negocio

---

# src/app/(tabs)/

Define la navegación tipo Bottom Tabs.

```txt
(tabs)/
├── index.tsx
├── menu.tsx
└── _layout.tsx
```

---

## _layout.tsx

Configura:

* iconos
* nombres tabs
* estilos navegación
* comportamiento del tab navigator

Ejemplo:

```tsx
<Tabs>
```

---

## index.tsx

Representa la ruta principal del Home.

Generalmente únicamente renderiza:

```tsx
<HomePage />
```

La lógica real vive dentro de:

```txt
features/home
```

---

# features/

Es el núcleo principal de la arquitectura.

Cada carpeta representa una funcionalidad completa de la aplicación.

```txt
features/
├── auth/
├── home/
└── vehicles/
```

---

# Organización Interna de Cada Feature

Cada feature contiene:

```txt
feature/
├── components/
├── hooks/
├── pages/
└── services/
```

---

# ¿Por qué usar Features?

Permite agrupar todo por contexto funcional.

Ejemplo:

Todo lo relacionado con vehículos vive dentro de:

```txt
features/vehicles
```

Esto evita:

* archivos dispersos
* dependencias desordenadas
* proyectos difíciles de mantener

---

# features/auth/

Contiene todo el sistema de autenticación.

---

## components/

Componentes exclusivos del login.

Ejemplos:

```txt
LoginForm.tsx
SocialButton.tsx
RememberMe.tsx
```

---

## hooks/

Hooks personalizados relacionados con autenticación.

Ejemplo:

```txt
useLogin.ts
```

Aquí puede manejarse:

* estado del formulario
* validaciones
* loading
* errores
* peticiones login

---

## pages/

Pantallas completas de la feature.

Ejemplo:

```txt
LoginPage.tsx
```

Estas páginas ensamblan:

* componentes
* hooks
* servicios

---

## services/

Conexión con backend o APIs.

Ejemplo:

```txt
auth.service.ts
```

Responsable de:

* login
* registro
* refresh token
* autenticación

---

# features/home/

Módulo encargado del Home principal.

Puede contener:

* buscador
* filtros
* banners
* cards de vehículos
* categorías

---

# features/vehicles/

Contiene toda la lógica relacionada con vehículos.

---

## components/

Ejemplos:

```txt
VehicleCard.tsx
VehicleFilters.tsx
VehicleForm.tsx
```

---

## hooks/

Ejemplo:

```txt
useVehicles.ts
```

Se encarga de:

* traer vehículos
* filtrar
* ordenar
* loading
* manejo de estados

---

## services/

Ejemplo:

```txt
vehicles.service.ts
```

Responsable de:

* llamadas API
* conexión Supabase
* Firebase
* backend

---

# shared/

Contiene código reutilizable globalmente.

```txt
shared/
├── components/
├── hooks/
├── services/
└── utils/
```

---

# shared/components/

Componentes reutilizables en toda la aplicación.

Ejemplos:

```txt
Button.tsx
Input.tsx
Loader.tsx
Modal.tsx
Navbar.tsx
```

Estos componentes pueden utilizarse en múltiples features.

---

# shared/hooks/

Hooks reutilizables.

Ejemplos:

```txt
useColorScheme.ts
useClientOnlyValue.ts
```

---

# shared/services/

Servicios globales.

Actualmente:

```txt
supabase.ts
```

Aquí se configuran:

* cliente Supabase
* axios
* interceptores
* tokens
* configuración HTTP global

---

# shared/utils/

Funciones auxiliares reutilizables.

Ejemplos:

```txt
formatDate.ts
currency.ts
validators.ts
```

---

# state/

Contiene el estado global de la aplicación.

```txt
state/
├── useAuthStore.ts
└── useRentaStore.ts
```

Aquí se maneja información compartida como:

* usuario autenticado
* sesión
* reservas
* carrito
* tema global

Esto permite centralizar el estado.

---

# styles/

Contiene estilos globales.

Ejemplos:

```txt
colors.ts
spacing.ts
theme.ts
globalStyles.ts
```

Permite mantener consistencia visual.

---

# types/

Contiene interfaces y tipos TypeScript.

```txt
types/
└── index.ts
```

Ejemplo:

```ts
export interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
}
```

Beneficios:

* autocompletado
* tipado fuerte
* menos errores
* mantenimiento sencillo

---

# Flujo General de la Aplicación

## Ejemplo del flujo Home

```txt
src/app/(tabs)/index.tsx
        ↓
features/home/pages/HomePage.tsx
        ↓
features/home/components/
        ↓
features/home/hooks/
        ↓
features/home/services/
        ↓
shared/services/supabase.ts
```

---

# Flujo de Responsabilidades

## app/

Maneja navegación.

---

## pages/

Construyen pantallas completas.

---

## components/

Construyen partes reutilizables de UI.

---

## hooks/

Manejan lógica y estado.

---

## services/

Manejan APIs y backend.

---

## shared/

Contiene elementos reutilizables globales.

---

# Beneficios Técnicos de esta Arquitectura

## Escalabilidad

Permite agregar nuevas funcionalidades fácilmente.

Ejemplo:

```txt
features/payments
features/profile
features/reservations
```

---

## Separación de Responsabilidades

Cada carpeta tiene una responsabilidad específica.

---

## Reutilización

Los componentes shared pueden reutilizarse en toda la app.

---

## Mantenimiento

Los errores son más fáciles de localizar.

---

## Trabajo en Equipo

Cada desarrollador puede trabajar en una feature diferente sin conflictos.

---

# Tecnologías Utilizadas

* React Native
* Expo
* Expo Router
* TypeScript
* Zustand
* Supabase

---

# Conclusión

La arquitectura implementada en RentaMovil sigue estándares modernos de desarrollo frontend mobile utilizando:

* organización por funcionalidades
* componentes reutilizables
* navegación desacoplada
* tipado fuerte
* separación clara de responsabilidades

Esto permite construir una aplicación:

* mantenible
* escalable
* profesional
* preparada para backend real
* fácil de extender en el futuro
