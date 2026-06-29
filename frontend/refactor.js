const fs = require('fs');
const path = require('path');
const componentsDir = './src/components';
const appDir = './src/app';

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/import { useColorScheme } from 'react-native';/g, "import { useTheme } from '@/context/ThemeContext';");
  content = content.replace(/const scheme = useColorScheme\(\);/g, "const { scheme } = useTheme();");
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', filePath);
  }
}

fs.readdirSync(componentsDir).forEach(file => {
  if (file.endsWith('.tsx')) replaceInFile(path.join(componentsDir, file));
});
replaceInFile(path.join(appDir, 'index.tsx'));
replaceInFile(path.join(appDir, '_layout.tsx'));
