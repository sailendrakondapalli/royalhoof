const fs = require('fs');
const path = require('path');

// Files to fix based on Vercel error
const filesToFix = [
  'src/context/LanguageContext.jsx',
  'src/pages/ProductDetailPage.jsx',
  'src/pages/CheckoutPage.jsx'
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace all problematic characters
    content = content
      .replace(/\u2013/g, '-')  // en-dash
      .replace(/\u2014/g, '-')  // em-dash
      .replace(/\u2018/g, "'")  // left single quote
      .replace(/\u2019/g, "'")  // right single quote
      .replace(/\u201C/g, '"')  // left double quote
      .replace(/\u201D/g, '"')  // right double quote
      .replace(/\u2026/g, '...') // ellipsis
      .replace(/\uFFFD/g, '-');  // replacement character
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
  }
});

console.log('\nDone!');
