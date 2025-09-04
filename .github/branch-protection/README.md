# Branch Protection Configuration

Эта папка содержит конфигурационные файлы для защиты веток в GitHub.

## Файлы

- `main-protection.json` - настройки защиты для ветки `main`
- `develop-protection.json` - настройки защиты для ветки `develop`

## Настройки защиты

### Основные правила
- **Защита от удаления** ✅
- **Защита от force push** ✅
- **Требует PR перед merge** ✅
- **Требует минимум 1 approval** ✅
- **Требует актуальности ветки** ✅

### Применение настроек

```bash
# Для ветки main
gh api repos/GTFB/lnd-boilerplate/branches/main/protection --method PUT --input .github/branch-protection/main-protection.json

# Для ветки develop
gh api repos/GTFB/lnd-boilerplate/branches/develop/protection --method PUT --input .github/branch-protection/develop-protection.json
```

## Workflow
- В `main` попадают только релизы через PR из `develop`
- В `develop` попадают фичи через PR из feature веток
- Прямые коммиты в обе ветки запрещены
- Удаление веток запрещено
