import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { findAssetReferences, copyAssets, replaceAssetPaths } from '../src/core/asset-handler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('asset-handler', () => {
  describe('findAssetReferences', () => {
    it('should find src attributes with absolute paths', () => {
      const code = '<img src="/logo.png" /><img src="/images/hero.jpg" />';
      const assets = findAssetReferences(code);

      expect(assets).toContain('/logo.png');
      expect(assets).toContain('/images/hero.jpg');
      expect(assets).toHaveLength(2);
    });

    it('should find href attributes with absolute paths', () => {
      const code = '<a href="/about">About</a><link href="/styles.css" />';
      const assets = findAssetReferences(code);

      expect(assets).toContain('/about');
      expect(assets).toContain('/styles.css');
    });

    it('should ignore external URLs', () => {
      const code = '<img src="https://example.com/logo.png" /><img src="//cdn.com/image.jpg" />';
      const assets = findAssetReferences(code);

      expect(assets).toHaveLength(0);
    });

    it('should ignore http URLs in href', () => {
      const code = '<a href="http://example.com">Link</a>';
      const assets = findAssetReferences(code);

      expect(assets).toHaveLength(0);
    });
  });

  describe('copyAssets', () => {
    const testDir = path.join(__dirname, 'fixtures', 'copy-test');
    const outputDir = path.join(testDir, 'output');
    const projectRoot = testDir;

    beforeEach(() => {
      // 创建测试目录和文件
      fs.mkdirSync(path.join(testDir, 'public'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'public', 'logo.png'), 'fake-image-data');
    });

    afterEach(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it('should copy assets from public directory', () => {
      const assetPaths = ['/logo.png'];
      const copiedAssets = copyAssets(assetPaths, outputDir, projectRoot);

      expect(copiedAssets).toHaveLength(1);
      expect(copiedAssets[0].original).toBe('/logo.png');
      expect(copiedAssets[0].relative).toBe('./assets/logo.png');
      expect(fs.existsSync(path.join(outputDir, 'assets', 'logo.png'))).toBe(true);
    });

    it('should handle nested directory assets', () => {
      fs.mkdirSync(path.join(testDir, 'public', 'images'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'public', 'images', 'hero.jpg'), 'fake-image');

      const assetPaths = ['/images/hero.jpg'];
      const copiedAssets = copyAssets(assetPaths, outputDir, projectRoot);

      expect(copiedAssets).toHaveLength(1);
      expect(fs.existsSync(path.join(outputDir, 'assets', 'images', 'hero.jpg'))).toBe(true);
    });

    it('should handle multiple assets', () => {
      fs.writeFileSync(path.join(testDir, 'public', 'icon.svg'), 'svg-data');

      const assetPaths = ['/logo.png', '/icon.svg'];
      const copiedAssets = copyAssets(assetPaths, outputDir, projectRoot);

      expect(copiedAssets).toHaveLength(2);
    });

    it('should return empty array for non-existent assets', () => {
      const assetPaths = ['/non-existent.png'];
      const copiedAssets = copyAssets(assetPaths, outputDir, projectRoot);

      expect(copiedAssets).toHaveLength(0);
    });

    it('should copy assets from app directory', () => {
      fs.mkdirSync(path.join(testDir, 'app'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'app', 'icon.svg'), 'fake-svg-data');

      const assetPaths = ['/icon.svg'];
      const copiedAssets = copyAssets(assetPaths, outputDir, projectRoot);

      expect(copiedAssets).toHaveLength(1);
      expect(copiedAssets[0].original).toBe('/icon.svg');
      expect(fs.existsSync(path.join(outputDir, 'assets', 'icon.svg'))).toBe(true);
    });
  });

  describe('replaceAssetPaths', () => {
    it('should replace absolute paths with relative paths', () => {
      const code = '<img src="/logo.png" />';
      const copiedAssets = [
        { original: '/logo.png', relative: './assets/logo.png' }
      ];
      const result = replaceAssetPaths(code, copiedAssets);

      expect(result).toBe('<img src="./assets/logo.png" />');
    });

    it('should replace multiple occurrences', () => {
      const code = '<img src="/logo.png" /><img src="/logo.png" />';
      const copiedAssets = [
        { original: '/logo.png', relative: './assets/logo.png' }
      ];
      const result = replaceAssetPaths(code, copiedAssets);

      expect(result).toBe('<img src="./assets/logo.png" /><img src="./assets/logo.png" />');
    });

    it('should handle empty copiedAssets array', () => {
      const code = '<img src="/logo.png" />';
      const copiedAssets = [];
      const result = replaceAssetPaths(code, copiedAssets);

      expect(result).toBe('<img src="/logo.png" />');
    });

    it('should handle special regex characters in paths', () => {
      const code = '<img src="/path.with.dots/file.png" />';
      const copiedAssets = [
        { original: '/path.with.dots/file.png', relative: './assets/path.with.dots/file.png' }
      ];
      const result = replaceAssetPaths(code, copiedAssets);

      expect(result).toBe('<img src="./assets/path.with.dots/file.png" />');
    });
  });
});
