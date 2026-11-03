# Анимированные объяснения · Arhimed Studio (ManimGX)

Исходники анимаций хранятся здесь и **не попадают в браузерную сборку**.
В приложение отдаются только отрендеренные файлы.

## Структура

```
authoring/manimgx/          исходники .py (этот каталог)
public/lessons/manimgx/     отрендеренные .mp4, .vtt, постеры
```

## Рендер

```bash
# из каталога authoring/manimgx
manimgl vectors_sum.py VectorSum -o --video_dir ../../public/lessons/manimgx
```

Рекомендуемые параметры: 1280×720, 30 fps, H.264, длительность 40–90 с.

## Контракт

Каждая анимация описывается в модуле через `AnimationLesson`:

```ts
animation: {
  id: "vectors-sum",
  title: "Сложение векторов",
  mp4: "/lessons/manimgx/vectors_sum.mp4",
  poster: "/lessons/manimgx/vectors_sum.jpg",
  captions: "/lessons/manimgx/vectors_sum.ru.vtt",
  durationSeconds: 62,
  sourceFile: "authoring/manimgx/vectors_sum.py",
  transcript: ["...", "..."],   // обязательная текстовая альтернатива
}
```

## Правила

1. `transcript` обязателен: если видео не отрендерено или не загрузилось,
   плеер показывает текстовое объяснение и урок остаётся проходимым.
2. Просмотр анимации **не засчитывает** учебный этап: ученик обязан
   выполнить исследовательское задание во вкладке «Эксперимент».
3. Субтитры `.vtt` на русском языке желательны для каждой анимации.
