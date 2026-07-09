````md
# Add-on de Ajustes de Minecraft para Pterodactyl

[🇬🇧 English](README.md) | 🇪🇸 Español

> **Creado por Ventus2033**

Añade fácilmente una pestaña de **Ajustes de Minecraft** a tu panel de Pterodactyl, permitiéndote administrar las propiedades de tu servidor de Minecraft desde una interfaz dedicada sin afectar las modificaciones existentes de tu panel.

---

## 📦 Instalación

### 1. Añade el componente

Copia el archivo `MinecraftPropertiesContainer.tsx` en el siguiente directorio:

```text
resources/scripts/components/server/
```

---

### 2. Edita `ServerRouter.tsx`

Abre:

```text
resources/scripts/routers/ServerRouter.tsx
```

y sigue los siguientes pasos.

---

### Paso 1 — Importa el componente

Añade estos imports cerca de la parte superior del archivo (si aún no existen):

```tsx
import MinecraftPropertiesContainer from '@/components/server/MinecraftPropertiesContainer';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
```

---

### Paso 2 — Añade el botón a la barra lateral

Localiza el componente `<Sidebar>`.

Justo antes de la etiqueta de cierre `</Sidebar>`, añade:

```tsx
{/* PESTAÑA PERSONALIZADA */}
<NavLink to={to('/minecraft', true)} exact>
    <div className='icon'>
        <FontAwesomeIcon icon={faCogs} />
    </div>
    Ajustes de Minecraft
</NavLink>
```

---

### Paso 3 — Registra la ruta

Busca la siguiente sección:

```tsx
<Switch location={location}>
```

Después, justo **antes** de la ruta global `NotFound`:

```tsx
<Route path={'*'} component={NotFound} />
```

inserta:

```tsx
{/* RUTA DE AJUSTES DE MINECRAFT */}
<Route path={to('/minecraft')} exact>
    <Spinner.Suspense>
        <MinecraftPropertiesContainer />
    </Spinner.Suspense>
</Route>
```

---

## 🔨 Compila el panel

Después de guardar los cambios, recompila los archivos del frontend ejecutando:

```bash
cd /var/www/pterodactyl
yarn build:production
```

---

## 🧹 Limpia la caché del navegador

Una vez finalice la compilación, realiza una recarga completa del navegador para asegurarte de que se cargan los nuevos archivos.

**Windows/Linux**

```text
Ctrl + F5
```

**macOS**

```text
⌘ + Shift + R
```

---

## 📁 Ejemplos

El repositorio incluye un directorio **`EXAMPLE`** con archivos de referencia para ayudarte a integrar el add-on en tu panel.

Úsalos como guía si no estás seguro de dónde debe ir cada modificación.

---

## ✅ Compatibilidad

Este add-on está diseñado para paneles basados en el **frontend React de Pterodactyl**.

Como cada panel puede incluir modificaciones personalizadas, se recomienda **fusionar manualmente** los cambios en lugar de reemplazar los archivos existentes.

---

## ❤️ Créditos

Desarrollado por **Ventus2033**.
````

