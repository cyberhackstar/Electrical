const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  // Correct relative paths inside Vercel's execution task folder
  const possiblePaths = [
    path.join(__dirname, '../dist/server/main.js'),
    path.join(__dirname, '../dist/server/server.mjs'),
    path.join(__dirname, '../dist/electromart-frontend/server/main.js'),
    path.join(__dirname, '../dist/electromart-frontend/server/server.mjs'),
    path.join(process.cwd(), 'dist/server/main.js'),
    path.join(process.cwd(), 'dist/server/server.mjs'),
  ];

  const serverModulePath = possiblePaths.find((p) => fs.existsSync(p));

  if (!serverModulePath) {
    let debugInfo = 'Searching for server build...\n';
    try {
      debugInfo += `CWD: ${process.cwd()}\n`;
      debugInfo += `__dirname: ${__dirname}\n`;
      debugInfo += `Dist Contents: ${JSON.stringify(fs.readdirSync(path.join(process.cwd(), 'dist')))}`;
    } catch (e) {
      debugInfo += `Error scanning dir: ${e.message}`;
    }
    return res.status(500).send(`SSR Bundle Not Found.\n${debugInfo}`);
  }

  if (serverModulePath.endsWith('.mjs')) {
    import(serverModulePath)
      .then((module) => {
        const app = module.reqHandler || module.app || module.default;
        app(req, res);
      })
      .catch((err) => res.status(500).send('SSR Execution Error: ' + err.stack));
  } else {
    const module = require(serverModulePath);
    const app = module.reqHandler || module.app || module.default;
    app(req, res);
  }
};
