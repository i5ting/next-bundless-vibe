const { transformToESM, transformCSS, getComponentName, extractLayoutBodyClass } = require('./transformer');

/**
 * 生成带 layout 的 HTML 页面
 * @param {string} pageCode - 页面代码
 * @param {string} layoutCode - layout 代码
 * @param {string} globalCSS - 全局 CSS
 * @param {string} routeName - 路由名称
 * @returns {string} HTML 内容
 */
function generateHTMLWithLayout(pageCode, layoutCode, globalCSS, routeName) {
  const esmPageCode = transformToESM(pageCode);
  const esmLayoutCode = transformToESM(layoutCode);
  const pageName = getComponentName(pageCode);
  const bodyClass = extractLayoutBodyClass(layoutCode);
  const transformedCSS = transformCSS(globalCSS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${routeName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
${transformedCSS}
  </style>
</head>
<body class="${bodyClass}">
  <div id="root"></div>

  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel">
    const { useState, useEffect } = React;

    // Page Component
${esmPageCode}

    // Layout Component
    function RootLayout({ children }) {
      return (
        <>
          {children}
        </>
      );
    }

    // Render
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <RootLayout>
        <${pageName} />
      </RootLayout>
    );
  </script>
</body>
</html>`;
}

module.exports = {
  generateHTMLWithLayout
};
