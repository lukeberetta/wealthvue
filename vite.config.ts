import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import yahooFinanceDefault from 'yahoo-finance2';

// @ts-ignore
const YahooFinance = yahooFinanceDefault.default || yahooFinanceDefault;
const yahooFinance = new YahooFinance();

const yahooFinancePlugin = () => ({
  name: 'yahoo-finance-api',
  configureServer(server: any) {
    server.middlewares.use('/api/price', async (req: any, res: any) => {
      // Parse the query string manually since req is a raw Node.js IncomingMessage
      const url = new URL(req.originalUrl || req.url, `http://${req.headers.host}`);
      const ticker = url.searchParams.get('ticker');
      if (!ticker) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Ticker is required' }));
        return;
      }
      try {
        const quote = await yahooFinance.quote(ticker);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(quote));
      } catch (error: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), yahooFinancePlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
