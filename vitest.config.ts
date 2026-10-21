import { defineConfig } from 'vitest/config'

// Unit tests only. Kept separate from vite.config.ts, whose root is app/ (the site source).
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
