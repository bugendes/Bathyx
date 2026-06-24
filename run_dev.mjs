#!/usr/bin/env node
const { createServer } = await import('vite');
const server = await createServer({
  server: { host: '0.0.0.0', port: 5174 }
});
await server.listen();
server.printUrls();
console.log('READY');
