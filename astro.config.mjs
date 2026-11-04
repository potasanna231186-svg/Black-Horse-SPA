// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Адрес сайта на GitHub Pages. Если подключите свой домен — поменяйте site и уберите base.
export default defineConfig({
  site: 'https://potasanna231186-svg.github.io',
  base: '/Black-Horse-SPA',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'ru', locales: { ru: 'ru-RU', en: 'en-US', it: 'it-IT', fr: 'fr-FR', ar: 'ar' } },
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
});
