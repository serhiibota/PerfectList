# MinimalList

Минималистичный PWA-список покупок для нескольких магазинов с подсчётом бюджета и экспортом в «длинный чек» (PNG).

**Стек:** Vite · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide Icons · html-to-image · vite-plugin-pwa

## Запуск

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build (dist/, с service worker)
npm run preview   # предпросмотр собранной PWA
```

## Возможности

- Несколько списков, в каждом — несколько магазинов на одном полотне
- Товар: название, количество, единица (шт, кг, г, пачка, л, мл, уп), примерная цена за единицу
- Промежуточный итог в шапке каждого магазина и плавающая плашка «Бюджет / Осталось потратить»
- Отметка покупки: плавное зачёркивание → перенос в свёрнутую секцию «Куплено»
- «Длинный чек»: PNG всего списка без элементов управления, с футером «✨ Скомпоновано в MinimalList»; отправка через `navigator.share`, иначе скачивание
- Настройки: тема (авто / светлая / тёмная) и иконка приложения — «Графит» (тёмная) или «Лён» (светлая)
- Данные хранятся только в `localStorage`, бэкенд не нужен
- Работает без интернета и в браузере, и после установки на экран «Домой»: service worker кэширует всё приложение, при потере сети в шапке появляется плашка «Офлайн»

## Структура

```
src/
  types/shopping.ts        модели данных
  hooks/useShoppingList.ts состояние + сохранение в localStorage
  hooks/useTheme.ts        тема (system/light/dark)
  lib/format.ts            деньги, количества, суммы
  lib/share.ts             рендер PNG (html-to-image) + Web Share API
  components/              StoreCard, ItemRow, AddItemForm, AddStore, BudgetBar,
                           Header, ListsSheet, ReceiptView, Toast, …
```
