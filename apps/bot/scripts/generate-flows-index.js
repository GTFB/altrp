const fs = require('fs');
const path = require('path');

// Путь к папке с флоу
const flowsDir = path.join(__dirname, '../src/config/flows');
const indexPath = path.join(flowsDir, 'index.ts');

// Получаем все .ts файлы в папке flows (кроме index.ts)
const files = fs.readdirSync(flowsDir)
  .filter(file => file.endsWith('.ts') && file !== 'index.ts')
  .map(file => file.replace('.ts', ''))
  .sort();

console.log('🔍 Found flow files:', files);

// Генерируем содержимое index.ts
const generateIndexContent = (flowFiles) => {
  const imports = flowFiles.map(fileName => {
    const flowName = fileName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const flowExportName = `${flowName.charAt(0).toLowerCase() + flowName.slice(1)}Flow`;
    return `import { ${flowExportName} } from './${fileName}';`;
  }).join('\n');

  const flowsObject = flowFiles.map(fileName => {
    const flowName = fileName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const flowExportName = `${flowName.charAt(0).toLowerCase() + flowName.slice(1)}Flow`;
    return `  ${fileName}: ${flowExportName}`;
  }).join(',\n');

  const exports = flowFiles.map(fileName => {
    const flowName = fileName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    return `${flowName.charAt(0).toLowerCase() + flowName.slice(1)}Flow`;
  }).join(',\n');

  return `import type { BotFlow } from '../../core/flow-types';

// Автоматически сгенерированный файл - НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ!
// Для регенерации запустите: npm run generate-flows-index

${imports}

// Объект со всеми флоу для совместимости с flow-engine.ts
export const flows: Record<string, BotFlow> = {
${flowsObject}
};

// Экспорт отдельных флоу для удобства
export {
  ${exports}
};
`;
};

// Генерируем и записываем файл
const content = generateIndexContent(files);
fs.writeFileSync(indexPath, content, 'utf8');

console.log('✅ Generated index.ts with', files.length, 'flows');
console.log('📁 Files included:', files.join(', '));
