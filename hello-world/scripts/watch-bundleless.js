#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 导入生成脚本的核心函数
const generateScript = require('./generate-with-assets-core.js');

/**
 * Watch 模式主函数
 */
function watchMode() {
  const appDir = path.join(process.cwd(), 'app');
  const publicDir = path.join(process.cwd(), 'public');

  console.log('👀 Watch 模式已启动...');
  console.log(`📁 监听目录: ${appDir}`);
  console.log(`📁 监听目录: ${publicDir}`);
  console.log('💡 按 Ctrl+C 退出\n');

  // 首次生成
  console.log('🔄 首次生成...\n');
  generateScript.generate();

  let isGenerating = false;
  let pendingRegenerate = false;

  /**
   * 处理文件变动
   */
  const handleChange = (eventType, filename) => {
    if (!filename) return;

    // 忽略某些文件
    if (filename.includes('.swp') || filename.includes('.tmp') || filename.startsWith('.')) {
      return;
    }

    console.log(`📝 检测到变动: ${filename}`);

    if (isGenerating) {
      pendingRegenerate = true;
      console.log('⏳ 正在生成中，将在完成后重新生成...\n');
      return;
    }

    regenerate();
  };

  /**
   * 重新生成
   */
  const regenerate = () => {
    isGenerating = true;
    pendingRegenerate = false;

    console.log('🔄 重新生成中...\n');

    try {
      generateScript.generate();
      console.log('✅ 生成完成\n');
    } catch (error) {
      console.error('❌ 生成失败:', error.message);
    } finally {
      isGenerating = false;

      if (pendingRegenerate) {
        setTimeout(regenerate, 100);
      }
    }
  };

  // 监听 app 目录
  const appWatcher = fs.watch(appDir, { recursive: true }, handleChange);

  // 监听 public 目录（如果存在）
  let publicWatcher = null;
  if (fs.existsSync(publicDir)) {
    publicWatcher = fs.watch(publicDir, { recursive: true }, handleChange);
  }

  // 处理退出
  process.on('SIGINT', () => {
    console.log('\n\n👋 停止监听...');
    appWatcher.close();
    if (publicWatcher) {
      publicWatcher.close();
    }
    process.exit(0);
  });
}

// 执行 watch 模式
watchMode();
