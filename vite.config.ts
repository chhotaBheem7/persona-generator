import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify('AIzaSyDR36IehYKYu-d5UvA5_-u1Fzrz9ZpSr_g')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
