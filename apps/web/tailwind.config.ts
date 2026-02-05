import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1B3A5C',
        teal: '#2C7A7B',
        sand: '#F5F1E8',
        ink: '#0E1B2B'
      }
    }
  },
  plugins: []
};

export default config;
