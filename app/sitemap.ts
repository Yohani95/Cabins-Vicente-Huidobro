import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cabanas-vicente-huidobro.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['es', 'en'];
  const routes = ['', 'cabanas', 'piscina', 'ubicacion', 'contacto'];
  
  const sitemap: MetadataRoute.Sitemap = [];

  // Generar URLs para cada idioma y ruta
  locales.forEach((locale) => {
    routes.forEach((route) => {
      const url = route ? `${siteUrl}/${locale}/${route}` : `${siteUrl}/${locale}`;
      
      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : route === 'contacto' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : route === 'cabanas' ? 0.9 : 0.8,
        alternates: {
          languages: {
            es: route ? `${siteUrl}/es/${route}` : `${siteUrl}/es`,
            en: route ? `${siteUrl}/en/${route}` : `${siteUrl}/en`
          }
        }
      });
    });
  });

  return sitemap;
}

