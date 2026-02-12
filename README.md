# QuickOrder - Sistema de Pedidos WhatsApp

Un sistema moderno de pedidos por WhatsApp para distribuidores de vasos y termos, construido con React, TypeScript y Firebase.

## 🚀 Características

- **Catálogo de Productos**: Visualización organizada por categorías
- **Sistema de Precios**: Precios minoristas y mayoristas dinámicos
- **Carrito de Compras**: Gestión completa del carrito con persistencia local
- **Integración WhatsApp**: Envío automático de pedidos por WhatsApp
- **Panel de Administración**: Gestión de pedidos y control de inventario
- **Base de Datos Firebase**: Sincronización en tiempo real
- **Diseño Responsivo**: Optimizado para móvil y desktop
- **Modo Offline**: Funciona sin conexión a internet

## 📁 Estructura del Proyecto

```
bazar/
├── public/
│   ├── data/
│   │   └── products/
│   │       └── productos.json    # Archivo JSON con productos
│   ├── images/
│   │   ├── products/     # Imágenes de productos
│   │   ├── icons/        # Íconos de la aplicación
│   │   └── logo/         # Logo y branding
│   └── index.html
├── src/
│   ├── components/       # Componentes React
│   ├── constants.ts      # Configuración y datos estáticos
│   ├── types.ts          # Definiciones TypeScript
│   ├── utils.ts          # Funciones utilitarias
│   ├── firebaseConfig.ts # Configuración Firebase
│   ├── App.tsx           # Componente principal
│   └── index.tsx         # Punto de entrada
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Firebase

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Frannkode/QuickOrder.git
cd QuickOrder

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase
```

### Configuración de Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firestore Database
3. Obtener las credenciales de configuración
4. Agregarlas al archivo `.env.local`

### Ejecución en Desarrollo
```bash
npm run dev
```

### Construcción para Producción
```bash
npm run build
npm run preview
```

## 📊 Gestión de Datos de Productos

### Archivo JSON de Productos
Los productos se pueden gestionar a través del archivo `public/data/products/productos.json`. Esta estructura permite:

- **Actualización fácil**: Modificar productos sin tocar código
- **Backup simple**: Archivo JSON fácil de versionar
- **Importación masiva**: Agregar múltiples productos rápidamente

### Estructura del JSON
```json
[
  {
    "id": "vaso-termico-1",
    "name": "Nombre del Producto",
    "description": "Descripción detallada",
    "priceRetail": 25000,
    "priceWholesale": 20000,
    "wholesaleThreshold": 5,
    "category": "Categoría",
    "imageUrl": "/images/products/nombre-imagen.jpg",
    "stock": 15,
    "featured": true
  }
]
```

### Campos del Producto
- **id**: Identificador único (string)
- **name**: Nombre del producto
- **description**: Descripción detallada
- **priceRetail**: Precio minorista (número)
- **priceWholesale**: Precio mayorista (número)
- **wholesaleThreshold**: Cantidad mínima para precio mayorista
- **category**: Categoría del producto
- **imageUrl**: Ruta a la imagen del producto
- **stock**: Cantidad disponible
- **featured**: Si aparece destacado (boolean)

## 📸 Gestión de Imágenes

### Estructura de Imágenes
```
public/images/
├── products/           # Imágenes de productos
│   ├── vasos-termicos/
│   ├── vasos-kawaii/
│   ├── accesorios/
│   └── placeholder-*.png
├── icons/             # Íconos de UI
│   ├── cart.svg
│   ├── user.svg
│   └── admin.svg
└── logo/              # Logo y branding
    ├── logo-main.png
    ├── logo-small.png
    └── favicon.ico
```

### Convenciones de Nombres
- **Productos**: `categoria-nombre-producto.jpg`
- **Ejemplos**:
  - `vasos-termicos-quencher-1l.jpg`
  - `vasos-kawaii-hello-kitty.jpg`
  - `accesorios-destapador.jpg`

### Optimización
- Formatos: WebP, JPG, PNG
- Tamaño máximo: 500KB por imagen
- Resolución recomendada: 800x800px para productos

## 🎨 Personalización

### Colores
El sistema utiliza una paleta de colores rosa y violeta:
- **Rosa principal**: `#fd8ed2`
- **Violeta**: `#dac2fe`
- **Gradientes**: Combinaciones de brand-500 a brand-600

### Configuración
Editar `constants.ts` para:
- Cambiar nombre de la tienda
- Modificar precios y productos
- Actualizar información de contacto

## 📱 Uso de la Aplicación

### Para Clientes
1. **Explorar Catálogo**: Navegar productos por categorías
2. **Agregar al Carrito**: Seleccionar productos y cantidades
3. **Realizar Pedido**: Completar formulario y enviar por WhatsApp

### Para Administradores
1. **Acceder al Panel**: Usar PIN de administrador
2. **Gestionar Pedidos**: Ver, actualizar estados y eliminar pedidos
3. **Control de Inventario**: Revisar stock y productos

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Variables de Entorno en Vercel
```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@quickorder.com
- WhatsApp: +54 9 11 1234 5678

---

**Desarrollado con ❤️ para distribuidores de vasos y termos**
