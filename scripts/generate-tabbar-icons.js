/**
 * 生成 TabBar 占位图标（81x81 透明 PNG）
 * 正式图标准备好后替换 static/tabbar/ 下文件即可
 */
const fs = require('fs');
const path = require('path');

// 最小合法 1x1 透明 PNG
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const buffer = Buffer.from(PNG_BASE64, 'base64');

const dir = path.join(__dirname, '..', 'static', 'tabbar');
const icons = [
  'home.png',
  'home-active.png',
  'records.png',
  'records-active.png',
  'bills.png',
  'bills-active.png',
  'stats.png',
  'stats-active.png',
  'profile.png',
  'profile-active.png',
];

fs.mkdirSync(dir, { recursive: true });
icons.forEach((name) => {
  fs.writeFileSync(path.join(dir, name), buffer);
});

console.log(`已生成 ${icons.length} 个 TabBar 占位图标 -> static/tabbar/`);
