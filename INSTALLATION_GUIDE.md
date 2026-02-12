# Guía de Instalación Completa - Sistema de Pedidos WhatsApp

Esta guía te ayudará a configurar y ejecutar la aplicación en una nueva computadora desde cero.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

### 1. Node.js
- **Versión requerida**: 18.0.0 o superior
- **Descarga**: https://nodejs.org/
- **Verificación**: Abre una terminal y ejecuta:
  ```bash
  node --version
  npm --version
  ```

### 2. Git
- **Descarga**: https://git-scm.com/
- **Verificación**:
  ```bash
  git --version
  ```

### 3. PostgreSQL (para el backend)
- **Versión requerida**: 12.0 o superior
- **Descarga**: https://www.postgresql.org/download/
- **Verificación**:
  ```bash
  psql --version
  ```

### 4. Firebase Account
- Crea una cuenta en https://firebase.google.com/
- Crea un nuevo proyecto
- Habilita Firestore Database
- Obtén las credenciales de configuración

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Frannkode/QuickOrder.git
cd QuickOrder
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno

#### Para Firebase:
1. Copia el archivo `firebase-keys.txt` y obtén las credenciales de tu proyecto Firebase
2. Crea un archivo `.env.local` en la raíz del proyecto
3. Agrega las siguientes variables de entorno:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

#### Para PostgreSQL (Backend):
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_base_datos
```

### Paso 4: Configurar la Base de Datos

#### Crear Base de Datos PostgreSQL:
```sql
-- Conéctate a PostgreSQL como superusuario
psql -U postgres

-- Crear base de datos
CREATE DATABASE quickorder_db;

-- Crear usuario (opcional)
CREATE USER quickorder_user WITH PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE quickorder_db TO quickorder_user;
```

#### Ejecutar Migraciones (si existen):
```bash
# Si hay scripts de migración en el proyecto
npm run migrate
```

### Paso 5: Configurar Firebase

1. Ve a la consola de Firebase: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a "Firestore Database" y crea una base de datos
4. Configura las reglas de seguridad según tus necesidades

### Paso 6: Ejecutar la Aplicación

#### Modo Desarrollo:
```bash
# Frontend + Backend
npm run dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

#### Construir para Producción:
```bash
npm run build
npm run preview
```

## 🔧 Solución de Problemas Comunes

### Error de Dependencias
Si hay conflictos de dependencias:
```bash
npm install --legacy-peer-deps
```

### Error de Puerto Ocupado
Si el puerto 3000 está ocupado:
```bash
# Cambiar puerto en vite.config.ts o usar:
npm run dev -- --port 3001
```

### Problemas con PostgreSQL
- Asegúrate de que el servicio esté ejecutándose
- Verifica las credenciales en la cadena de conexión
- Revisa los logs de PostgreSQL

### Firebase No Conecta
- Verifica que las variables de entorno estén correctas
- Asegúrate de que Firestore esté habilitado
- Revisa la consola del navegador para errores

## 📱 Funcionalidades de la Aplicación

- **Catálogo de Productos**: Visualización de productos con imágenes y precios
- **Carrito de Compras**: Agregar, editar y eliminar productos
- **Sistema de Pedidos WhatsApp**: Integración directa con WhatsApp
- **Panel de Administración**: Gestión de pedidos y inventario
- **Precios Mayoristas/Minoristas**: Sistema de precios dinámicos
- **Soporte Offline**: Funciona sin conexión a internet

## 📞 Soporte

Si encuentras problemas durante la instalación, verifica:
1. Que todas las dependencias estén instaladas correctamente
2. Que las variables de entorno estén configuradas
3. Que la base de datos esté ejecutándose
4. Los logs de la consola para errores específicos

¡La aplicación está lista para usar!
