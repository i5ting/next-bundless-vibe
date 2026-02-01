const fs = require('fs');
const path = require('path');

/**
 * Watch 模式配置
 */
class WatchConfig {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.appDir = options.appDir || path.join(this.projectRoot, 'app');
    this.publicDir = options.publicDir || path.join(this.projectRoot, 'public');
    this.debounceDelay = options.debounceDelay || 100;
  }
}

/**
 * 文件监听器
 */
class FileWatcher {
  constructor(generator, config) {
    this.generator = generator;
    this.config = config instanceof WatchConfig ? config : new WatchConfig(config);
    this.isGenerating = false;
    this.pendingRegenerate = false;
    this.watchers = [];
  }

  /**
   * 启动监听
   */
  start() {
    const { appDir, publicDir } = this.config;

    console.log('👀 Watch 模式已启动...');
    console.log(`📁 监听目录: ${appDir}`);
    console.log(`📁 监听目录: ${publicDir}`);
    console.log('💡 按 Ctrl+C 退出\n');

    // 首次生成
    console.log('🔄 首次生成...\n');
    this.generator.generate();

    // 监听 app 目录
    const appWatcher = fs.watch(appDir, { recursive: true }, this.handleChange.bind(this));
    this.watchers.push(appWatcher);

    // 监听 public 目录（如果存在）
    if (fs.existsSync(publicDir)) {
      const publicWatcher = fs.watch(publicDir, { recursive: true }, this.handleChange.bind(this));
      this.watchers.push(publicWatcher);
    }

    // 处理退出
    process.on('SIGINT', () => this.stop());
  }

  /**
   * 处理文件变动
   */
  handleChange(eventType, filename) {
    if (!filename) return;

    // 忽略某些文件
    if (filename.includes('.swp') || filename.includes('.tmp') || filename.startsWith('.')) {
      return;
    }

    console.log(`📝 检测到变动: ${filename}`);

    if (this.isGenerating) {
      this.pendingRegenerate = true;
      console.log('⏳ 正在生成中，将在完成后重新生成...\n');
      return;
    }

    this.regenerate();
  }

  /**
   * 重新生成
   */
  regenerate() {
    this.isGenerating = true;
    this.pendingRegenerate = false;

    console.log('🔄 重新生成中...\n');

    try {
      this.generator.generate();
      console.log('✅ 生成完成\n');
    } catch (error) {
      console.error('❌ 生成失败:', error.message);
    } finally {
      this.isGenerating = false;

      if (this.pendingRegenerate) {
        setTimeout(() => this.regenerate(), this.config.debounceDelay);
      }
    }
  }

  /**
   * 停止监听
   */
  stop() {
    console.log('\n\n👋 停止监听...');
    this.watchers.forEach(watcher => watcher.close());
    process.exit(0);
  }
}

module.exports = {
  FileWatcher,
  WatchConfig
};
