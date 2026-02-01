import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readLayout, readGlobalCSS } from '../src/utils/file-reader';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('file-reader', () => {
  const testDir = path.join(__dirname, 'fixtures', 'file-reader-test');

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('readLayout', () => {
    it('should read layout.tsx file', () => {
      const layoutContent = 'export default function Layout() {}';
      fs.writeFileSync(path.join(testDir, 'layout.tsx'), layoutContent);

      const result = readLayout(testDir);

      expect(result).toBe(layoutContent);
    });

    it('should read layout.js file', () => {
      const layoutContent = 'export default function Layout() {}';
      fs.writeFileSync(path.join(testDir, 'layout.js'), layoutContent);

      const result = readLayout(testDir);

      expect(result).toBe(layoutContent);
    });

    it('should return null if no layout file exists', () => {
      const result = readLayout(testDir);

      expect(result).toBeNull();
    });

    it('should prefer layout.tsx over layout.js', () => {
      fs.writeFileSync(path.join(testDir, 'layout.tsx'), 'tsx content');
      fs.writeFileSync(path.join(testDir, 'layout.js'), 'js content');

      const result = readLayout(testDir);

      expect(result).toBe('tsx content');
    });
  });

  describe('readGlobalCSS', () => {
    it('should read globals.css file', () => {
      const cssContent = '.class { color: red; }';
      fs.writeFileSync(path.join(testDir, 'globals.css'), cssContent);

      const result = readGlobalCSS(testDir);

      expect(result).toBe(cssContent);
    });

    it('should return empty string if no globals.css exists', () => {
      const result = readGlobalCSS(testDir);

      expect(result).toBe('');
    });
  });
});