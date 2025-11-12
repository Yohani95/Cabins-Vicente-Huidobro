# Cabañas Vicente Huidobro

> Sitio web profesional, bilingüe y optimizado para SEO para el arriendo de cabañas en Cartagena, Chile.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-Private-red)

## 🏡 Acerca del Proyecto

Aplicación web moderna para **Cabañas Vicente Huidobro**, ubicadas en Vicente Huidobro 384, Cartagena, Región de Valparaíso, Chile. El sitio ofrece información completa sobre dos cabañas equipadas con piscina iluminada, a minutos de la playa y del Museo Vicente Huidobro.

### ✨ Características Principales

- 🌍 **Bilingüe**: Español e inglés con detección automática
- 📱 **Responsive**: Diseño optimizado para móvil, tablet y desktop
- 🎨 **Diseño Rústico**: Paleta de colores cálidos y naturales
- 🗺️ **Mapa Interactivo**: Integración con Leaflet y enlaces a Google Maps/Waze/Apple Maps
- 🔍 **SEO Optimizado**: Metadatos completos, sitemap dinámico, robots.txt y schema.org
- ⚡ **Performance**: Optimización de imágenes, compresión y headers de seguridad
- 🎭 **Animaciones Suaves**: Framer Motion para transiciones elegantes

## 🛠️ Stack Tecnológico

### Core
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript 5.6
- **Estilos**: TailwindCSS + diseño personalizado
- **Animaciones**: Framer Motion

### Features
- **i18n**: next-intl con middleware automático
- **Mapas**: react-leaflet + leaflet
- **Backend**: Supabase (cliente oficial)
- **Icons**: lucide-react
- **Fonts**: Inter (body) + Merriweather (display)

### SEO & Performance
- Sitemap.xml dinámico
- robots.txt configurado
- Schema.org (LodgingBusiness)
- OpenGraph + Twitter Cards
- Headers de seguridad
- Compresión de imágenes (AVIF/WebP)

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Cuenta de Supabase (opcional para reservas futuras)

## 🚀 Instalación

```bash

# Instalar dependencias
cd cabanas-vicente-huidobro
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# URL del sitio (producción)
NEXT_PUBLIC_SITE_URL=https://cabanas-vicente-huidobro.com

# Supabase (opcional para futuras funcionalidades)
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## 📜 Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo (http://localhost:3000)
npm run build     # Build de producción
npm run start     # Servir build de producción
npm run lint      # Linter (ESLint)
```

## 📁 Estructura del Proyecto

```
cabanas-vicente-huidobro/
├── app/
│   ├── [locale]/           # Rutas internacionalizadas
│   │   ├── page.tsx        # Home / Landing
│   │   ├── cabanas/        # Página de cabañas
│   │   ├── piscina/        # Página de piscina
│   │   ├── ubicacion/      # Página con mapa
│   │   ├── contacto/       # Página de contacto
│   │   └── layout.tsx      # Layout con metadatos y schema
│   ├── sitemap.ts          # Sitemap dinámico
│   ├── favicon.ico         # Favicon del sitio
│   └── globals.css         # Estilos globales
├── components/
│   ├── Navbar.tsx          # Navegación con logo
│   ├── Footer.tsx          # Footer con créditos
│   ├── CabanaCard.tsx      # Tarjeta de cabaña
│   ├── MapComponent.tsx    # Mapa interactivo
│   ├── LanguageSwitcher.tsx
│   └── ui/                 # Componentes base
├── lib/
│   ├── i18n/
│   │   ├── messages.es.json  # Traducciones español
│   │   └── messages.en.json  # Traducciones inglés
│   ├── supabaseClient.ts
│   └── utils.ts
├── public/
│   ├── images/             # Imágenes del sitio
│   │   ├── cabanas/
│   │   ├── piscina/
│   │   └── common/
│   ├── leaflet/            # Iconos del mapa
│   └── robots.txt          # SEO: directivas para bots
├── middleware.ts           # Detección de idioma
├── next.config.ts          # Configuración de Next.js
├── next-intl.config.ts     # Configuración i18n
└── tailwind.config.ts      # Configuración de Tailwind
```

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Wood | `#8B5E3C` | Texto principal, acentos |
| Sand | `#C2B280` | Bordes, fondos suaves |
| Olive | `#3E5C4B` | CTAs, enlaces |
| Canvas | `#FAF8F5` | Fondo principal |

## 🌐 Internacionalización

- **Idiomas soportados**: Español (predeterminado) y English
- **Detección automática**: Cookie + Accept-Language header
- **Rutas**: `/es/*` y `/en/*`
- **Alternates**: Configurados para SEO multiidioma

## 🔍 SEO

### Implementado
- ✅ Metadatos dinámicos por idioma
- ✅ Sitemap.xml con alternates
- ✅ robots.txt optimizado
- ✅ Schema.org (LodgingBusiness) con amenidades
- ✅ OpenGraph + Twitter Cards
- ✅ Canonical URLs
- ✅ Alt text en imágenes
- ✅ Headers de seguridad

### Verificar SEO

```bash
# Verifica el sitemap
curl http://localhost:3000/sitemap.xml

# Verifica robots.txt
curl http://localhost:3000/robots.txt

# Prueba metadatos
# Usa herramientas como:
# - Google Rich Results Test
# - Facebook Sharing Debugger
# - Twitter Card Validator
```

## 📞 Información de Contacto

- **Dirección**: Vicente Huidobro 384, Cartagena, Chile
- **Teléfono**: [+56 9 7526 7860](https://wa.me/56975267860)
- **Horario de atención**: 09:00 - 01:00 (todos los días)

### Ubicación Destacada
A 3-5 minutos del **Museo Vicente Huidobro** (Cmo. Eden del Poeta)

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configura variables de entorno en Vercel Dashboard
```

### Variables en Producción
- `NEXT_PUBLIC_SITE_URL`: URL del sitio en producción
- `NEXT_PUBLIC_SUPABASE_URL`: (opcional)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (opcional)

## 🛠️ Panel de Administración

La ruta `/admin` ofrece un panel optimizado para tablet:

- Dashboard con métricas en tiempo real (ocupación, reservas pendientes, pagos, mensajes).
- Gestión completa de reservas (crear, editar, cancelar) con Server Actions seguras.
- Módulo de mensajes con filtros, marcado de leídos y archivado.
- Historial de pagos por reserva con balance y registro rápido.
- Calendario mensual por cabaña y panel de alertas (check-in/out próximos, saldos, mensajes).
- Indicadores en la navegación para contar pendientes.

> Para acceder, crea un usuario en Supabase Auth y añádelo a la tabla `admin_users`.

```
insert into public.admin_users (user_id, role)
values ('UUID_DEL_USUARIO', 'owner');
```

## 🗺️ Roadmap

### v0.2.0 (Próximo)
- [ X] Panel de administración (tablet-optimized)
- [ X] Sistema de reservas con Supabase
- [ X] Integración de pagos
- [ ] Recordatorios automáticos
- [ ] Galería de fotos ampliada

### Futuro
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Sistema de reviews
- [ ] Blog sobre Cartagena

## 🧪 Testing

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🤝 Contribución

Este es un proyecto privado para Cabañas Vicente Huidobro.

## 👨‍💻 Desarrollador

**Yohani Espinoza Duarte**
- Ingeniero en Informática
- Portfolio: [portafolio-yohani.vercel.app](https://portafolio-yohani.vercel.app/)
- GitHub: [@yohani-espinoza](https://github.com/yohani-espinoza)

## 📄 Licencia

© 2025 Cabañas Vicente Huidobro. Todos los derechos reservados.
Uso interno exclusivo.

## 🙏 Agradecimientos

- Next.js Team por el excelente framework
- Vercel por el hosting
- Comunidad de Next-intl
- Leaflet por los mapas interactivos

---

**Versión**: 0.1.0  
**Última actualización**: Noviembre 2025  
**Desarrollado con ❤️ por Yohani Espinoza**
