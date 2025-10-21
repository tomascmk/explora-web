# 🔧 Explora Web - Troubleshooting Guide

**Last Updated**: October 21, 2025

---

## 🚨 Common Errors & Solutions

### Error: "Failed to read RSC payload - React version mismatch"

**Error Message**:
```
Failed to read a RSC payload created by a development version of React 
on the server while using a production version on the client.
```

**Causa**:
- Caché corrupto de Next.js/Turbopack
- Node modules mezclados entre versiones
- HMR (Hot Module Replacement) error

**Solución**:
```bash
cd /Users/tomascormack/Documents/GitHub/explora-web

# 1. Matar servidor
pkill -f "next dev"

# 2. Limpiar TODO
rm -rf .next node_modules pnpm-lock.yaml

# 3. Reinstalar
pnpm install

# 4. Reiniciar
pnpm dev
```

✅ **Tiempo estimado**: 2-3 minutos

---

### Error: "Module factory is not available" (HMR)

**Error Message**:
```
Module 9097 was instantiated but the module factory is not available. 
It might have been deleted in an HMR update.
```

**Causa**:
- Turbopack HMR error después de cambios de código
- Caché corrupto

**Solución Quick**:
```bash
# Opción 1: Reiniciar servidor
pkill -f "next dev"
cd /Users/tomascormack/Documents/GitHub/explora-web
pnpm dev
```

**Solución Completa**:
```bash
# Si persiste, limpiar caché
cd /Users/tomascormack/Documents/GitHub/explora-web
rm -rf .next
pnpm dev
```

**En el navegador**:
- Hard refresh: **Cmd+Shift+R** (Mac) o **Ctrl+Shift+R** (Windows/Linux)

---

### Error: Login/Register "Failed to fetch"

**Causa**:
- Backend no está corriendo
- Puerto 3001 ocupado por otro proceso

**Solución**:
```bash
# 1. Verificar si backend está corriendo
curl http://localhost:3001/graphql

# 2. Si no responde, verificar puerto
lsof -i :3001

# 3. Matar proceso si está ocupado
kill -9 <PID>

# 4. Iniciar backend
cd /Users/tomascormack/Documents/GitHub/explora-api
pnpm run start:dev
```

---

### Error: TypeORM Enum Mismatch

**Error Message**:
```
invalid input value for enum users_roles_enum: "tourist"
```

**Causa**:
- Enum en base de datos tiene valores viejos (minúsculas)
- Código usa valores nuevos (MAYÚSCULAS)
- TypeORM `synchronize: true` intenta migrar y falla

**Solución**:
```bash
# 1. Limpiar base de datos completamente
cd /Users/tomascormack/Documents/GitHub/explora-api
docker-compose down -v

# 2. Reiniciar base de datos
pnpm run start:docker

# 3. Esperar 10 segundos

# 4. Reiniciar backend (TypeORM recreará tablas)
pnpm run start:dev
```

**Solución Quirúrgica** (si no quieres perder datos):
```bash
# Eliminar solo el enum problemático
docker exec explora_db psql -U explora -d explora_db -c "DROP TYPE IF EXISTS users_roles_enum CASCADE;"
docker exec explora_db psql -U explora -d explora_db -c "DROP TABLE IF EXISTS users CASCADE;"

# Reiniciar backend
cd /Users/tomascormack/Documents/GitHub/explora-api
pnpm run start:dev
```

---

### Error: Registration "Field roles was not provided"

**Error Message**:
```
Field "roles" of required type "String!" was not provided
```

**Solución**:
✅ Ya está arreglado en código (commit `fd94d04`)

Asegúrate de tener la última versión:
```bash
cd /Users/tomascormack/Documents/GitHub/explora-web
git pull
pnpm install
```

---

### Error: Password Validation

**Error Message**:
```
La contraseña debe contener al menos una letra mayúscula, 
una minúscula, un número y un carácter especial
```

**Causa**:
- El backend tiene validación estricta de contraseñas

**Solución**:
Usa una contraseña que cumpla todos los requisitos:

✅ **Ejemplos válidos**:
- `Password123!`
- `Guide@2025`
- `MySecure#Pass1`

❌ **Ejemplos inválidos**:
- `password123` (falta mayúscula y especial)
- `Password` (falta número y especial)
- `PASSWORD123!` (falta minúscula)

---

### Error: Port Already in Use

**Error Message**:
```
Port 3000 is already in use
```

**Solución**:
```bash
# Ver qué está usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O matar todos los procesos de Next.js
pkill -f "next dev"
```

---

### Error: Middleware Redirect Loop

**Síntoma**: Infinite redirects a `/login`

**Causa**:
- Middleware buscando token en cookies
- Token almacenado en localStorage

**Solución**:
✅ Ya está arreglado en código (commit `d5da512`)

El middleware ahora usa client-side auth con `AuthContext`.

---

### Error: Contraste Bajo / Texto No Visible

**Síntoma**: Labels gris claro, texto difícil de leer

**Causa**:
- Browser theme (dark mode) interfiriendo
- Estilos Tailwind sobrescritos por browser

**Solución**:
✅ Ya está arreglado en código (commit `8ad292b`)

El `globals.css` ahora fuerza light mode y colores específicos.

**Si persiste**:
- Hard refresh: **Cmd+Shift+R**
- Limpia caché del navegador
- Desactiva extensiones del navegador

---

## 🛠️ Nuclear Option (Limpieza Total)

Si NADA funciona, ejecuta esto:

```bash
cd /Users/tomascormack/Documents/GitHub/explora-web

# 1. Matar todos los procesos
pkill -f "next dev"

# 2. Limpiar TODO
rm -rf .next node_modules pnpm-lock.yaml

# 3. Reinstalar desde cero
pnpm install

# 4. Build para verificar
pnpm run build

# 5. Iniciar dev
pnpm dev
```

En el navegador:
- Cerrar TODAS las pestañas de localhost:3000
- Limpiar caché: DevTools → Application → Clear storage
- Abrir nueva pestaña incógnito
- Ir a http://localhost:3000

---

## 📊 Verificación de Servicios

### Backend (API)

```bash
# Verificar que está corriendo
curl http://localhost:3001/graphql

# Ver logs
cd /Users/tomascormack/Documents/GitHub/explora-api
# Ver terminal donde corre pnpm run start:dev

# Ver procesos
ps aux | grep "nest start" | grep -v grep
```

### Frontend (Guide Portal)

```bash
# Verificar que está corriendo
curl -I http://localhost:3000

# Ver qué usa el puerto
lsof -i :3000

# Ver procesos
ps aux | grep "next dev" | grep -v grep
```

### Base de Datos

```bash
# Verificar Docker container
docker ps | grep explora_db

# Ver logs
docker logs explora_db

# Conectarse a DB
docker exec -it explora_db psql -U explora -d explora_db
```

---

## 🔍 Comandos de Debugging

### Ver Todos los Procesos de Explora

```bash
ps aux | grep -E "explora|nest|next" | grep -v grep
```

### Ver Todos los Puertos Ocupados

```bash
lsof -i :3000  # Guide Portal
lsof -i :3001  # API
lsof -i :3002  # Admin Portal
lsof -i :5433  # PostgreSQL
lsof -i :8081  # Expo
```

### Matar Todos los Procesos de Explora

```bash
pkill -f "explora-api"
pkill -f "explora-web"
pkill -f "explora-admin"
pkill -f "next dev"
pkill -f "nest start"
```

---

## 📝 Logs Útiles

### Ver Logs del Backend

```bash
cd /Users/tomascormack/Documents/GitHub/explora-api

# Ver últimas 50 líneas
tail -50 <archivo_log_si_existe>

# O ver terminal donde corre
# El output se muestra directamente en terminal
```

### Ver Network Requests en Browser

1. Abrir DevTools (F12)
2. Tab "Network"
3. Filter: "Fetch/XHR"
4. Intentar login/register
5. Ver request/response

---

## 🎯 Checklist de Estado Saludable

Antes de empezar a desarrollar, verifica:

- [ ] Docker container corriendo: `docker ps | grep explora_db`
- [ ] Backend corriendo: `curl http://localhost:3001/graphql` devuelve HTML
- [ ] Frontend corriendo: `curl -I http://localhost:3000` devuelve 200 OK
- [ ] No hay procesos duplicados: `ps aux | grep "next dev\|nest start"`
- [ ] Puertos libres: `lsof -i :3000 :3001 :3002`

---

## 💡 Tips de Prevención

1. **Siempre usa pnpm** (no mezcles npm, yarn, pnpm)
2. **Un solo proceso por servicio** (matar antes de reiniciar)
3. **Git pull antes de trabajar** (evita conflictos)
4. **Hard refresh después de cambios CSS** (Cmd+Shift+R)
5. **Revisa console/network en browser** (F12)

---

## 🆘 Última Opción

Si después de todo sigue sin funcionar:

```bash
# Reinstalar TODOS los proyectos
cd /Users/tomascormack/Documents/GitHub/explora-api
rm -rf node_modules pnpm-lock.yaml dist
pnpm install

cd /Users/tomascormack/Documents/GitHub/explora-web
rm -rf node_modules pnpm-lock.yaml .next
pnpm install

cd /Users/tomascormack/Documents/GitHub/explora-admin
rm -rf node_modules pnpm-lock.yaml .next
pnpm install

cd /Users/tomascormack/Documents/GitHub/explora-app
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Resetear Docker
docker-compose down -v
docker-compose up -d
```

---

**Desarrollado por**: Tomas Cormack  
**Mantener actualizado** después de cada nuevo tipo de error encontrado

