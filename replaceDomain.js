const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');
const libDir = path.join(__dirname, 'lib');

function walk(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Replace double quoted strings: "https://api.dilvoicechat.fun
  content = content.replace(/"https:\/\/api\.dilvoicechat\.fun([^"]*)"/g, (match, p1) => {
    return `\`\${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}${p1}\``;
  });

  // 2. Replace single quoted strings: 'https://api.dilvoicechat.fun
  content = content.replace(/'https:\/\/api\.dilvoicechat\.fun([^']*)'/g, (match, p1) => {
    return `\`\${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}${p1}\``;
  });

  // 3. Replace template literals: `https://api.dilvoicechat.fun
  content = content.replace(/`https:\/\/api\.dilvoicechat\.fun([^`]*)`/g, (match, p1) => {
    return `\`\${process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun"}${p1}\``.replace(/\${videoUrl}/g, 'videoUrl'); // fix nested interpolation if double bracketed
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(__dirname, filePath)}`);
  }
}

walk(dir);
if (fs.existsSync(libDir)) {
  walk(libDir);
}
