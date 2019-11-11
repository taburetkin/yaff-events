const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
(async () => {
  let content = await jsdoc2md.render({
    files: ['index.js', 'events.js', 'interop.js'],
    configure: './tooling/jsdoc.config.js'
  });
  fs.writeFileSync('reference.md', content);
})();
