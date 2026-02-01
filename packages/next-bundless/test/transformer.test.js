import { describe, it, expect } from 'vitest';
import {
  transformToESM,
  transformCSS,
  getComponentName,
  extractLayoutBodyClass
} from '../src/core/transformer';

describe('transformer', () => {
  describe('transformToESM', () => {
    it('should remove Next.js Image import', () => {
      const code = `import Image from 'next/image';\nexport default function Page() {}`;
      const result = transformToESM(code);

      expect(result).not.toContain('next/image');
    });

    it('should remove Next.js Link import', () => {
      const code = `import Link from 'next/link';\nexport default function Page() {}`;
      const result = transformToESM(code);

      expect(result).not.toContain('next/link');
    });

    it('should replace Image with img tag', () => {
      const code = '<Image src="/logo.png" />';
      const result = transformToESM(code);

      expect(result).toContain('<img src="/logo.png" />');
    });

    it('should replace Link with a tag', () => {
      const code = '<Link href="/about">About</Link>';
      const result = transformToESM(code);

      expect(result).toContain('<a href="/about">About</a>');
    });

    it('should remove type imports from next', () => {
      const code = `import type { Metadata } from 'next';\nexport default function Page() {}`;
      const result = transformToESM(code);

      expect(result).not.toContain('import type');
      expect(result).not.toContain('from \'next\'');
    });

    it('should remove next/font/google imports', () => {
      const code = `import { Inter } from 'next/font/google';\nexport default function Page() {}`;
      const result = transformToESM(code);

      expect(result).not.toContain('next/font/google');
    });

    it('should remove globals.css imports', () => {
      const code = `import './globals.css';\nexport default function Page() {}`;
      const result = transformToESM(code);

      expect(result).not.toContain('./globals.css');
    });
  });

  describe('transformCSS', () => {
    it('should remove tailwindcss import', () => {
      const css = `@import "tailwindcss";\n.class { color: red; }`;
      const result = transformCSS(css);

      expect(result).not.toContain('tailwindcss');
      expect(result).toContain('.class { color: red; }');
    });

    it('should remove @theme inline blocks', () => {
      const css = `@theme inline { --color: red; }\n.class { color: red; }`;
      const result = transformCSS(css);

      expect(result).not.toContain('@theme');
      expect(result).toContain('.class { color: red; }');
    });
  });

  describe('getComponentName', () => {
    it('should extract component name from export default function', () => {
      const code = 'export default function HomePage() {}';
      const name = getComponentName(code);

      expect(name).toBe('HomePage');
    });

    it('should return default name if no match found', () => {
      const code = 'const Page = () => {};';
      const name = getComponentName(code);

      expect(name).toBe('Component');
    });
  });

  describe('extractLayoutBodyClass', () => {
    it('should extract body class from layout', () => {
      const code = '<body className={`antialiased ${geistSans.variable}`}>';
      const className = extractLayoutBodyClass(code);

      expect(className).toBe('antialiased');
    });

    it('should handle multiple variables in className', () => {
      const code = '<body className={`antialiased ${font1.variable} ${font2.variable}`}>';
      const className = extractLayoutBodyClass(code);

      expect(className).toBe('antialiased');
    });

    it('should return default class if no match found', () => {
      const code = '<body>';
      const className = extractLayoutBodyClass(code);

      expect(className).toBe('antialiased');
    });
  });
});
