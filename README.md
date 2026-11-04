# Black Horse SPA — сайт спа-салона на Astro

Сайт: **https://potasanna231186-svg.github.io/Black-Horse-SPA/**
Админ-панель: **https://potasanna231186-svg.github.io/Black-Horse-SPA/admin/**

Современный многостраничный сайт на [Astro](https://astro.build): русский и английский язык,
светлая и тёмная тема, запись через мессенджеры. Каждое изменение в ветке `main` автоматически
собирается и публикуется на GitHub Pages (`.github/workflows/deploy.yml`).

## Где что менять

| Что | Файл |
|---|---|
| Название, контакты, мессенджеры, адрес, часы, фото главного экрана, видео | `src/data/site.json` |
| Услуги и цены | `src/data/services.json` |
| Пакеты и сертификаты | `src/data/packages.json` |
| Вопросы и ответы | `src/data/faq.json` |
| Мастера | `src/data/team.json` |
| Галерея и категории фильтра | `src/data/gallery.json` |
| Отзывы (только настоящие) | `src/data/reviews.json` |
| Акция с таймером | `src/data/promo.json` |
| Все тексты интерфейса RU/EN | `src/data/ui.json` |
| Стили и цвета | `public/assets/style.css` |
| Фото и видео | папка `public/images/`, путь в JSON: `/images/имя.jpg` |

Проще всего менять всё через **админ-панель** `/admin/`: войдите кнопкой **Sign In with Token**
(личный токен GitHub: Settings → Developer settings → Fine-grained tokens, доступ
*Contents: Read and write* к репозиторию Black-Horse-SPA). Каждое сохранение = коммит, сайт
обновится примерно через минуту.

## Что уже встроено
- превью ссылки в WhatsApp, Telegram и соцсетях (Open Graph и картинка `public/assets/og.png`);
- разметка Schema.org для Google: DaySpa, прайс, FAQ, «хлебные крошки»;
- карта сайта `sitemap-index.xml` с языковыми версиями, страница 404, политика конфиденциальности (шаблон);
- полоса акции с обратным отсчётом, кнопка записи на телефоне, плавающая кнопка мессенджеров;
- фильтр галереи и просмотр фото, пакеты и абонементы, мастера с Instagram, блок видео;
- доступность: ссылка «Перейти к содержимому», управление с клавиатуры, учёт настройки «уменьшить движение».

## Запуск на своём компьютере (по желанию)
Нужен Node.js 20+ (https://nodejs.org).
```bash
npm install
npm run dev      # http://localhost:4321/Black-Horse-SPA/
npm run build    # готовый сайт в dist/
```

## Структура
```
src/data/        все тексты, цены и контакты (JSON)
src/lib/site.ts  ссылки, языки, разметка для Google
src/layouts/     общий макет (шапка, подвал, мета-теги)
src/components/  блоки: фото, мессенджеры, FAQ, пакеты, отзывы…
src/pages/       страницы; [...lang] — русская версия в корне и английская в /en/
public/          стили, скрипт, иконки, admin/, images/
tools/make_og.py перерисовать картинку-превью (Python + Pillow)
```
