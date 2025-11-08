const fs = require('fs');
const path = require('path');

// The path to the flow folder
const flowsDir = path.join(__dirname, '../src/config/flows');
const indexPath = path.join(flowsDir, 'index.ts');

// We get everything .ts files in the flows folder (except index.ts)
const files = fs.readdirSync(flowsDir)
  .filter(file => file.endsWith('.ts') && file !== 'index.ts')
  .map(file => file.replace('.ts', ''))
  .sort();

console.log('🔍 Found flow files:', files);

// Generating the content index.ts
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

// Automatically generated file - DO NOT EDIT IT MANUALLY!
// To regenerate, run: npm run generate-flows-index

${imports}

// An object with all the flows for compatibility with flow-engine.ts
export const flows: Record<string, BotFlow> = {
${flowsObject}
};

// Export individual flows for convenience
export {
  ${exports}
};
`;
};

// Generating and writing a file
const content = generateIndexContent(files);
fs.writeFileSync(indexPath, content, 'utf8');

console.log('✅ Generated index.ts with', files.length, 'flows');
console.log('📁 Files included:', files.join(', '));

