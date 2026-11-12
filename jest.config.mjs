import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** Jest + React Testing Library; next/jest wires SWC, CSS mocks and path aliases. */
export default createJestConfig({
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testMatch: ["<rootDir>/__tests__/**/*.test.tsx"],
});
