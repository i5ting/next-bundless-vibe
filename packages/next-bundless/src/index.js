const { BundlelessGenerator, GeneratorConfig } = require('./core/generator');
const { FileWatcher, WatchConfig } = require('./core/watcher');

/**
 * 创建生成器实例
 * @param {Object} options - 配置选项
 * @returns {BundlelessGenerator} 生成器实例
 */
function createGenerator(options = {}) {
  return new BundlelessGenerator(options);
}

/**
 * 创建监听器实例
 * @param {BundlelessGenerator} generator - 生成器实例
 * @param {Object} options - 配置选项
 * @returns {FileWatcher} 监听器实例
 */
function createWatcher(generator, options = {}) {
  return new FileWatcher(generator, options);
}

/**
 * 生成 bundleless 代码
 * @param {Object} options - 配置选项
 */
function generate(options = {}) {
  const generator = createGenerator(options);
  generator.generate();
}

/**
 * 启动 watch 模式
 * @param {Object} options - 配置选项
 */
function watch(options = {}) {
  const generator = createGenerator(options);
  const watcher = createWatcher(generator, options);
  watcher.start();
}

module.exports = {
  BundlelessGenerator,
  GeneratorConfig,
  FileWatcher,
  WatchConfig,
  createGenerator,
  createWatcher,
  generate,
  watch
};
