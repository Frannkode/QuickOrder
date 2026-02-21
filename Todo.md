# 📝 Plan de Mejoras y Refactorización (Todo.md)

Este documento contiene un análisis profundo del proyecto actual y las propuestas para convertirlo en un sistema "súper completo", escalable y con una excelente experiencia de usuario (UI/UX).

Por favor, marca con una `[x]` las áreas o puntos específicos por los que te gustaría que empiece, y yo me encargaré de implementarlos.

---

## 🛠️ 1. Refactorización y Arquitectura (Prioridad Alta)
Actualmente, el archivo `App.tsx` tiene más de 1800 líneas y contiene múltiples vistas y componentes (Carrito, Catálogo, Dashboard, Modales). Esto dificulta el mantenimiento y afecta el rendimiento.

- [x] **Dividir `App.tsx` en múltiples componentes:** Extraer componentes como `Cart.tsx`, `CheckoutForm.tsx`, `AdminDashboard.tsx`, y modales a la carpeta `src/components/`.
- [x] **Implementar React Router:** Cambiar el sistema actual de vistas condicionales por navegación real (Rutas para `/`, `/cart`, `/admin`, etc.) para permitir compartir URLs.
- [x] **Gestión de Estado Global (Context/Zustand):** Mover el carrito, favoritos y preferencias (tema) a un estado global para evitar pasar *props* por todos lados.
- [x] **Configurar TailwindCSS formalmente:** Asegurar de que TailwindCSS y PostCSS estén instalados y configurados correctamente en `package.json` para aprovechar todas sus funciones.

---

## 🎨 2. Mejoras de UI/UX (Diseño y Experiencia)
El diseño actual es bueno, pero podemos llevarlo al siguiente nivel para que se sienta moderno y "Premium".

- [x] **Animaciones Fluídas (Framer Motion o CSS Nativo):** Agregar animaciones de transición entre páginas, al abrir modales, y efectos *micro-interactivos* en las tarjetas de producto y botones.
- [ ] **Rediseño del Carrito de Compras:** Crear un carrito lateral desplegable (Off-canvas o *Drawer*) en lugar de una página entera separada, para no perder el contexto de la tienda.
- [x] **Mejoras en Estados Vacíos (Empty States):** Diseñar ilustraciones o mensajes amigables cuando el carrito, comparación o los favoritos están vacíos, en lugar de texto plano o dejar en blanco.
- [ ] **Imágenes Optimizadas (Lazy Loading):** Implementar carga diferida (lazy loading) y *blur-up placeholders* para que la página cargue instantáneamente.
- [x] **Notificaciones Mejoradas:** Integrar o mejorar librerías (como `sonner` o `react-hot-toast`) para notificaciones más estéticas y apilables.

---

## 🚀 3. Nuevas Funcionalidades (Para hacerlo "Súper Completo")
Aquí hay ideas para expandir el e-commerce basándome en los requerimientos de mercado actuales.

- [x] **Sistema de Autenticación de Usuarios:** Permitir que los clientes se registren (con Google o Email/Contraseña) para guardar su historial de compras y preferencias.
- [x] **Seguridad Avanzada en Admin Panel:** Reemplazar el PIN de 4 dígitos en duro por un inicio de sesión de administrador seguro.
- [ ] **Búsqueda Avanzada y Paginación:** Añadir autocompletado en la barra de búsqueda y filtros mucho más precisos (por colores, rango de precios múltiple).
- [x] **Gestión de Productos Completa en Base de Datos:** Migrar el catálogo de `productos.json` completamente a Firestore, y permitir crear, editar y eliminar productos (incluyendo subir fotos) directamente desde el Dashboard del Administrador.
- [ ] **Métricas y Estadísticas en Admin:** Gráficos visuales de ventas, productos más populares, pedidos en los últimos 7 días.
- [ ] **Cupones de Descuento:** Sistema para que el administrador cree códigos promocionales (ej: `PROMOSORPRESA`) y el usuario los aplique en el checkout.
- [ ] **Productos Relacionados y Reseñas:** Sección de "También te podría interesar" al ver un producto, y un sistema sencillo de 1 a 5 estrellas con comentarios.
- [ ] **PWA (App Instalable y Offline):** Configurar el proyecto como Progressive Web App con service workers robustos para que funcione impecable incluso sin conexión a internet y sea instalable en teléfonos.

---

**Instrucción:** Puedes ir marcando **uno o varios** `[ ]` con una `x` y avisarme, y yo diseñaré el plan de implementación y ejecutaré cada tarea asegurando la máxima calidad funcional y visual.
