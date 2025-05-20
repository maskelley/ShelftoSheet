import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on mode in current directory
  const env = loadEnv(mode, process.cwd());
  
  return {
    base: '/shelf-to-spreadsheet-magic/', // Moved inside the return object
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    define: {
      // Explicitly make environment variables available
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY)
    }
  };
});