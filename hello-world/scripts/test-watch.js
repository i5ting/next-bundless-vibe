#!/usr/bin/env node

// 简单测试 watch 脚本的导入
const generateScript = require('./generate-with-assets-core.js');

console.log('✅ 核心模块导入成功');
console.log('✅ generate 函数存在:', typeof generateScript.generate === 'function');

// 测试生成函数
console.log('\n测试生成函数...\n');
generateScript.generate();
