// Общие данные и помощники для всех страниц
import site from '../data/site.json';
import services from '../data/services.json';
import packages from '../data/packages.json';
import faq from '../data/faq.json';
import team from '../data/team.json';
import gallery from '../data/gallery.json';
import reviews from '../data/reviews.json';
import promo from '../data/promo.json';
import ui from '../data/ui.json';

export type Lang = 'ru' | 'en' | 'it' | 'fr' | 'ar';
/** Порядок языков в переключателе. ru — основной (без префикса в адресе) */
export const LANGS: Lang[] = ['ru', 'en', 'it', 'fr', 'ar'];
export const RTL: Lang[] = ['ar'];
export const dirOf = (l: Lang) => (RTL.includes(l) ? 'rtl' : 'ltr');
export const LOCALES: Record<Lang, string> = { ru: 'ru_RU', en: 'en_US', it: 'it_IT', fr: 'fr_FR', ar: 'ar_EG' };
export const LANG_LABEL: Record<Lang, string> = { ru: 'Русский', en: 'English', it: 'Italiano', fr: 'Français', ar: 'العربية' };
export const data = { site, services, packages, faq, team, gallery, reviews, promo, ui };
export { site };

/** Страницы сайта: ключ → путь */
export type Page = 'index' | 'services' | 'about' | 'gallery' | 'faq' | 'contacts' | 'privacy' | '404';

/** Пути для всех языков: ru без префикса, остальные — /en/, /it/, /fr/, /ar/ */
export function langPaths() {
  return LANGS.map((l) => ({ params: { lang: l === 'ru' ? undefined : l } }));
}
export function langOf(param?: string): Lang {
  return (LANGS as string[]).includes(param ?? '') ? (param as Lang) : 'ru';
}

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
const ORIGIN = 'https://potasanna231186-svg.github.io';

/** Ссылка на страницу (с якорем «services#rituals» тоже работает) */
export function url(page: string, lang: Lang): string {
  let anchor = '';
  if (page.includes('#')) { const i = page.indexOf('#'); anchor = page.slice(i); page = page.slice(0, i); }
  const prefix = lang === 'ru' ? '' : `${lang}/`;
  const path = !page || page === 'index' ? '' : `${page}/`;
  return `${BASE}${prefix}${path}${anchor}`;
}
export const absUrl = (page: string, lang: Lang) => ORIGIN + url(page, lang);
/** Путь к файлу из public/ (картинки, стили) */
export const asset = (p: string) => BASE + p.replace(/^\//, '');

type Tr = Partial<Record<Lang, string>> | string;
export const tr = (o: Tr | undefined, lang: Lang): string =>
  !o ? '' : typeof o === 'string' ? o : (o[lang] ?? o.en ?? o.ru ?? '');

export const t = (lang: Lang) => (ui as any)[lang];

export const money = (n: number, lang: Lang) =>
  lang === 'en' ? `${site.currencySymbol}${n}` : `${n} ${site.currencySymbol}`;

export const wa = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export type MsgKey = 'wa' | 'tg' | 'vb' | 'ig' | 'ph' | 'ml';
export function msgrLink(k: MsgKey, lang: Lang): string {
  switch (k) {
    case 'wa': return wa(t(lang).wa_greeting.replace('{name}', site.name));
    case 'tg': return `https://t.me/${site.telegram}`;
    case 'vb': return `viber://chat?number=${encodeURIComponent(site.viber)}`;
    case 'ig': return `https://instagram.com/${site.instagram}`;
    case 'ph': return `tel:${site.phoneRaw}`;
    case 'ml': return `mailto:${site.email}`;
  }
}
export const msgrName = (k: MsgKey, lang: Lang) =>
  ({ wa: 'WhatsApp', tg: 'Telegram', vb: 'Viber', ig: 'Instagram', ph: t(lang).call, ml: 'Email' })[k];

/** Структурированные данные Schema.org (JSON-LD) для Google */
export function schemaFor(page: Page, lang: Lang): object[] {
  const T = t(lang);
  const spa: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'DaySpa',
    name: site.name,
    description: tr(site.description, lang),
    url: absUrl('index', lang),
    telephone: site.phoneRaw,
    email: site.email,
    priceRange: site.priceRange,
    image: absUrl('index', 'ru') + 'assets/og.png',
    address: { '@type': 'PostalAddress', streetAddress: site.streetAddress, addressLocality: site.city, addressCountry: site.country },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: site.opens, closes: site.closes,
    }],
    sameAs: [`https://instagram.com/${site.instagram}`],
  };
  const out: object[] = [];
  if (page === 'index' || page === 'contacts') out.push(spa);
  if (page === 'services') out.push({
    ...spa,
    hasOfferCatalog: {
      '@type': 'OfferCatalog', name: T.nav_services,
      itemListElement: services.categories.flatMap(c => c.items.map(it => ({
        '@type': 'Offer', price: it.price, priceCurrency: site.currency,
        itemOffered: { '@type': 'Service', name: tr(it.name, lang), description: tr(it.desc, lang) },
      }))),
    },
  });
  if (page === 'index' || page === 'faq') {
    const items = page === 'faq' ? faq.items : faq.items.slice(0, 4);
    out.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: items.map(f => ({ '@type': 'Question', name: tr(f.q, lang), acceptedAnswer: { '@type': 'Answer', text: tr(f.a, lang) } })),
    });
  }
  if (page !== 'index' && page !== '404') out.push({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: T.nav_home, item: absUrl('index', lang) },
      { '@type': 'ListItem', position: 2, name: T[`nav_${page}`] ?? T.f_privacy, item: absUrl(page, lang) },
    ],
  });
  return out;
}

/** Метка версии сборки — добавляется к стилям и скриптам, чтобы браузер не держал старые файлы в кэше */
export const VERSION = Date.now().toString(36);
export const assetV = (p: string) => `${asset(p)}?v=${VERSION}`;
