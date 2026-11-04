import type { SeeReflection, SeeSpec } from "./types";

/** Объяснение результата эксперимента проверяется отдельным вопросом. */
const reflections: Record<string, SeeReflection> = {
  "a1-m1": {question:"Почему показание после калибровки может стать больше исходного?",options:[{id:"a",label:"Коэффициент масштабирования больше единицы"},{id:"b",label:"Величина всегда растёт"},{id:"c",label:"Размер входа не имеет значения"}],correctId:"a",correctFeedback:"Да: при k > 1 положительное показание увеличивается.",incorrectFeedback:"Подумайте, что происходит при умножении положительного числа на коэффициент больше единицы."},
  "a1-m4": {question:"Как ведёт себя сигмоида при очень больших положительных входах?",options:[{id:"a",label:"Неограниченно растёт"},{id:"b",label:"Приближается к единице"},{id:"c",label:"Всегда остаётся 0,5"}],correctId:"b",correctFeedback:"Сигмоида насыщается около единицы.",incorrectFeedback:"Посмотрите на верхнюю часть графика: рост там замедляется."},
  "a1-m6": {question:"Что означает изменение третьей координаты вектора состояния?",options:[{id:"a",label:"Изменение всех трёх характеристик"},{id:"b",label:"Переименование оси"},{id:"c",label:"Изменение только тяги при остальных неизменных"}],correctId:"c",correctFeedback:"Компоненты соответствуют заданному порядку показателей.",incorrectFeedback:"Каждая координата привязана к одному измерению."},
  "a1-m7": {question:"Почему результирующий вектор не обязательно равен длине пройденного пути?",options:[{id:"a",label:"Перемещения могут компенсировать друг друга"},{id:"b",label:"Координаты нельзя складывать"},{id:"c",label:"Векторы существуют только в 3D"}],correctId:"a",correctFeedback:"При сложении противоположных шагов итоговое смещение может быть малым.",incorrectFeedback:"Сравните путь туда и обратно с конечным перемещением."},
  "a1-m9": {question:"Что изменяет умножение вектора на матрицу преобразования?",options:[{id:"a",label:"Порядок выполнения программы"},{id:"b",label:"Координаты вектора по заданному линейному правилу"},{id:"c",label:"Количество датчиков"}],correctId:"b",correctFeedback:"Матрица задаёт линейное преобразование координат.",incorrectFeedback:"Матрица действует на входной вектор и формирует новый набор координат."},
  "a2-m1": {question:"Когда нейрон ReLU выдаёт нуль?",options:[{id:"a",label:"Когда сумма входов с учётом весов и смещения неположительна"},{id:"b",label:"Когда входов ровно два"},{id:"c",label:"Когда все веса равны единице"}],correctId:"a",correctFeedback:"ReLU обнуляет неположительную предактивацию.",incorrectFeedback:"Вспомните определение max(0, w·x+b)."},
  "a2-m3": {question:"Почему крупная ошибка сильнее влияет на MSE?",options:[{id:"a",label:"Потому что деление идёт на число параметров"},{id:"b",label:"Потому что ошибка берётся по модулю"},{id:"c",label:"Потому что разность возводится в квадрат"}],correctId:"c",correctFeedback:"Квадрат усиливает вклад больших отклонений.",incorrectFeedback:"Сравните квадраты ошибок 1 и 3."},
  "a2-m4": {question:"Что происходит с градиентом около минимума гладкой поверхности ошибки?",options:[{id:"a",label:"Его величина обычно стремится к нулю"},{id:"b",label:"Он всегда неограниченно растёт"},{id:"c",label:"Он становится равен скорости обучения"}],correctId:"a",correctFeedback:"В стационарном минимуме градиент близок к нулю.",incorrectFeedback:"У дна гладкой чаши наклон поверхности мал."},
  "a2-m5": {question:"Почему слишком большой learning rate может ухудшить обучение?",options:[{id:"a",label:"Он уменьшает число весов"},{id:"b",label:"Шаг может перескочить минимум"},{id:"c",label:"Он превращает все ошибки в нуль"}],correctId:"b",correctFeedback:"Шаг может вызвать колебания вместо сходимости.",incorrectFeedback:"Сравните положение точки до и после слишком большого шага."},
  "a2-m6": {question:"Почему при x = 0 вес w не получает градиент для y = wx?",options:[{id:"a",label:"Вес удаляется из памяти"},{id:"b",label:"Выход всегда становится единицей"},{id:"c",label:"Потому что производная dy/dw равна x"}],correctId:"c",correctFeedback:"При нулевом входе производная по весу равна нулю.",incorrectFeedback:"Продифференцируйте произведение wx по w."},
  "a3-m2": {question:"По какой кривой выбирают лучшую эпоху обучения?",options:[{id:"a",label:"Только по обучающей ошибке"},{id:"b",label:"По минимуму ошибки на проверочных данных"},{id:"c",label:"По максимальному числу эпох"}],correctId:"b",correctFeedback:"Validation позволяет оценивать обобщение на данных, не использованных для обучения.",incorrectFeedback:"Обучающая ошибка может уменьшаться даже при переобучении."},
  "a4-m1": {question:"Почему форма [3,4] отличается от формы [4,3]?",options:[{id:"a",label:"Число элементов разное"},{id:"b",label:"Перепутан порядок числа строк и столбцов"},{id:"c",label:"Вторую форму нельзя хранить"}],correctId:"b",correctFeedback:"Количество элементов равно, но ориентация осей отличается.",incorrectFeedback:"Сравните количество строк и число признаков в каждой строке."},
  "a5-m2": {question:"Почему два близких эмбеддинга не обязаны обозначать одинаковые объекты?",options:[{id:"a",label:"Близость выражает сходство по выученным признакам, а не идентичность"},{id:"b",label:"Векторы нельзя сравнивать"},{id:"c",label:"Любые объекты обязаны быть равны"}],correctId:"a",correctFeedback:"Близость — характеристика представления, а не строгая идентичность.",incorrectFeedback:"Семантическое сходство не означает совпадение объектов."},
  "a6-m1": {question:"Что определяет большую долю внимания к конкретному ключу?",options:[{id:"a",label:"Алфавитный порядок токенов"},{id:"b",label:"Случайная перестановка"},{id:"c",label:"Более высокая оценка сходства query с key"}],correctId:"c",correctFeedback:"Softmax превращает оценки query·key в веса.",incorrectFeedback:"Сравните скалярные произведения запроса с ключами."},
  "a6-m6": {question:"Почему одинаковый последний токен иногда ведёт к разным продолжениям?",options:[{id:"a",label:"Модель случайно меняет арифметику"},{id:"b",label:"Различается контекст ранних токенов"},{id:"c",label:"Вся последовательность всегда одинакова"}],correctId:"b",correctFeedback:"Контекст может менять правило, по которому продолжается последовательность.",incorrectFeedback:"Вспомните, где в истории был задан режим."},
};
export function strengthenSee(id: string, spec?: SeeSpec): SeeSpec | undefined {
  if (!spec) return undefined;
  const reflection = reflections[id];
  const sliders = spec.sliders ?? [];
  const goal = spec.goal;
  if (!goal || goal.checkHistory || sliders.length === 0) {
    return { ...spec, reflection: reflection ?? spec.reflection };
  }
  const explore = sliders[0];
  const low = explore.min + (explore.max - explore.min) * 0.3;
  const high = explore.min + (explore.max - explore.min) * 0.7;
  return {
    ...spec,
    reflection: reflection ?? spec.reflection,
    goal: {
      ...goal,
      // Сначала сопоставить крайние режимы, затем вернуться к рабочей настройке.
      checkHistory: (history) => {
        const last = history[history.length - 1];
        if (!last || !goal.check(last)) return false;
        const visitedLow = history.some((h) => h[explore.id] <= low);
        const visitedHigh = history.some((h) => h[explore.id] >= high);
        return visitedLow && visitedHigh;
      },
      progress: (_params, history) => {
        const visitedLow = history.some((h) => h[explore.id] <= low);
        const visitedHigh = history.some((h) => h[explore.id] >= high);
        return "Сравните два контрастных режима: " +
          (visitedLow ? "низкий ✓" : "низкий —") + ", " +
          (visitedHigh ? "высокий ✓" : "высокий —") +
          ". Затем настройте систему под условие задачи.";
      },
    },
  };
}
