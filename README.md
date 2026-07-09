# Minecraft Settings Tab Add-on for Pterodactyl

🇬🇧 English | [🇪🇸 Español](README.es.md)

> **Created by Ventus2033**

Easily add a **Minecraft Settings** tab to your Pterodactyl panel, allowing you to manage your Minecraft server properties from a dedicated interface without affecting your existing panel modifications.

---

## 📦 Installation

### 1. Add the Component

Copy the `MinecraftPropertiesContainer.tsx` file into the following directory:

```text
resources/scripts/components/server/
```

---

### 2. Edit `ServerRouter.tsx`

Open:

```text
resources/scripts/routers/ServerRouter.tsx
```

and complete the following steps.

---

### Step 1 — Import the Component

Add these imports near the top of the file (if they don't already exist):

```tsx
import MinecraftPropertiesContainer from '@/components/server/MinecraftPropertiesContainer';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
```

---

### Step 2 — Add the Sidebar Button

Locate the `<Sidebar>` component.

Just before the closing `</Sidebar>` tag, add:

```tsx
{/* CUSTOM TAB */}
<NavLink to={to('/minecraft', true)} exact>
    <div className='icon'>
        <FontAwesomeIcon icon={faCogs} />
    </div>
    Minecraft Settings
</NavLink>
```

---

### Step 3 — Register the Route

Find the following section:

```tsx
<Switch location={location}>
```

Then, just **before** the global `NotFound` route:

```tsx
<Route path={'*'} component={NotFound} />
```

insert:

```tsx
{/* MINECRAFT SETTINGS ROUTE */}
<Route path={to('/minecraft')} exact>
    <Spinner.Suspense>
        <MinecraftPropertiesContainer />
    </Spinner.Suspense>
</Route>
```

---

## 🔨 Build the Panel

After saving your changes, rebuild the frontend assets:

```bash
cd /var/www/pterodactyl
yarn build:production
```

---

## 🧹 Clear Your Browser Cache

After the build completes, perform a hard refresh to ensure the new assets are loaded.

**Windows/Linux**

```
Ctrl + F5
```

**macOS**

```
⌘ + Shift + R
```

---

## 📁 Examples

Example files are included inside the **`EXAMPLE`** directory.

Use them as a reference if you're unsure where each modification should be placed.

---

## ✅ Compatibility

This add-on is designed for panels based on the **Pterodactyl Panel React frontend**.

Since every panel may contain custom modifications, you should manually merge the changes instead of replacing existing files.

---

## ❤️ Credits

Developed by **Ventus2033**.
