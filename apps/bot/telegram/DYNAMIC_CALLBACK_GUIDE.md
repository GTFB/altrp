# Dynamic Callback Buttons Guide

## Обзор

Новый тип шага `dynamic_callback` позволяет создавать динамические кнопки на основе данных из базы данных. Это решает проблему необходимости статического определения кнопок в конфигурации флоу.

## Особенности

- ✅ **Динамическая генерация** - кнопки создаются на основе данных из БД
- ✅ **Префиксная система** - короткие callback_data с префиксом `dc_`
- ✅ **Ограничение Telegram** - соблюдение лимита в 64 байта для callback_data
- ✅ **Автоматическая обработка** - выбор сохраняется в переменную и происходит переход
- ✅ **Совместимость** - работает с существующей системой флоу

## Архитектура

### 1. Тип шага

```typescript
interface DynamicCallbackStep extends BaseFlowStep {
  type: 'dynamic_callback';
  handler: string; // хэндлер для генерации кнопок
  saveToVariable: string; // куда сохранить выбор
  nextStepId?: string | number; // следующий шаг
  nextFlow?: string; // следующий флоу
  callbackPrefix?: string; // кастомный префикс (опционально)
}
```

### 2. Формат callback_data

```
dc_<stepId>_<value>
```

Примеры:
- `dc_select_course_123` - выбор курса с ID 123
- `dc_select_service_456` - выбор услуги с ID 456

### 3. Хэндлер генерации кнопок

Хэндлер должен возвращать объект с полями:
- `message` - текст сообщения
- `buttons` - массив кнопок

```typescript
{
  message: 'Выберите курс:',
  buttons: [
    { text: 'Advanced React - $299', value: 1 },
    { text: 'Node.js Mastery - $399', value: 2 }
  ]
}
```

## Использование

### 1. Создание флоу

```typescript
export const myFlow: BotFlow = {
  name: 'my_flow',
  steps: [
    {
      type: 'dynamic_callback',
      id: 'select_course',
      handler: 'generateCourseButtons',
      saveToVariable: 'selected.course_id',
      nextStepId: 'show_course_details'
    }
  ]
};
```

### 2. Создание хэндлера

```typescript
generateCourseButtons: async (telegramId: number, contextManager: UserContextManager) => {
  // Получаем данные из БД
  const courses = await d1Storage.getCourses();
  
  const buttons = courses.map(course => ({
    text: `${course.name} - $${course.price}`,
    value: course.id
  }));
  
  return {
    message: '🎓 Выберите курс:',
    buttons: buttons
  };
}
```

### 3. Обработка выбора

После нажатия кнопки:
1. Значение сохраняется в `selected.course_id`
2. Происходит переход к `show_course_details`
3. В следующем шаге можно получить значение через `contextManager.getVariable(telegramId, 'selected.course_id')`

## Примеры

### Выбор курса

```typescript
// В флоу
{
  type: 'dynamic_callback',
  id: 'select_course',
  handler: 'generateCourseButtons',
  saveToVariable: 'selected.course_id',
  nextStepId: 'show_course_details'
}

// Хэндлер
generateCourseButtons: async (telegramId, contextManager) => {
  const courses = await getCourses();
  return {
    message: 'Выберите курс:',
    buttons: courses.map(c => ({
      text: c.name,
      value: c.id
    }))
  };
}
```

### Выбор услуги

```typescript
// В флоу
{
  type: 'dynamic_callback',
  id: 'select_service',
  handler: 'generateServiceButtons',
  saveToVariable: 'selected.service_id',
  nextStepId: 'process_service'
}

// Хэндлер
generateServiceButtons: async (telegramId, contextManager) => {
  const user = await getUser(telegramId);
  const services = await getUserServices(user.companyId);
  return {
    message: 'Выберите услугу:',
    buttons: services.map(s => ({
      text: s.name,
      value: s.id
    }))
  };
}
```

## Ограничения

### 1. Размер callback_data

Telegram ограничивает `callback_data` до 64 байт. Система автоматически:
- Проверяет длину
- Обрезает значение при необходимости
- Выводит предупреждение в лог

### 2. Формат значения

Значение в `callback_data` должно быть строкой. Для сложных объектов используйте JSON.stringify():

```typescript
// ❌ Неправильно
value: { id: 123, name: 'Course' }

// ✅ Правильно
value: JSON.stringify({ id: 123, name: 'Course' })
```

### 3. Обработка в хэндлерах

При получении значения в хэндлерах:

```typescript
const value = await contextManager.getVariable(telegramId, 'selected.course_id');
// Если сохраняли JSON
const courseData = JSON.parse(value);
```

## Тестирование

Для тестирования создан тестовый флоу `test_dynamic_callback`:

1. Запустите бота
2. Нажмите "🧪 Test Dynamic Callback" в главном меню
3. Выберите курс из динамически сгенерированных кнопок
4. Выберите услугу
5. Посмотрите финальный результат

## Отладка

### Логи

Система выводит подробные логи:
- `🔘 Processing dynamic callback: dc_select_course_123`
- `🔍 Parsed dynamic callback - stepId: select_course, value: 123`
- `✅ Found dynamic callback step: select_course, saving to: selected.course_id`

### Ошибки

Возможные ошибки:
- `❌ Dynamic callback handler not found` - хэндлер не найден
- `❌ Invalid dynamic callback format` - неправильный формат callback_data
- `❌ Dynamic callback step not found` - шаг не найден в флоу

## Миграция

Для миграции существующих статических кнопок:

1. Замените `type: 'callback'` на `type: 'dynamic_callback'`
2. Добавьте `handler` и `saveToVariable`
3. Создайте хэндлер для генерации кнопок
4. Удалите статический массив `buttons`

## Заключение

`dynamic_callback` решает проблему динамической генерации кнопок, сохраняя при этом простоту использования и совместимость с существующей системой. Префиксная система обеспечивает короткие callback_data, а автоматическая обработка упрощает интеграцию в флоу.
