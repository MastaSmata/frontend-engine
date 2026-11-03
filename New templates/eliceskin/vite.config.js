import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        collection: resolve(__dirname, 'src/pages/collection.html'),
        product: resolve(__dirname, 'src/pages/product.html'),
        about: resolve(__dirname, 'src/pages/about.html'),
        contact: resolve(__dirname, 'src/pages/contact.html')
      }
    }
  }
});
