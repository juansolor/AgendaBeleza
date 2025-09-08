// tests/setup.js - Configuración global para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PORT = 3001;

// Mock da base de dados para testes
jest.setTimeout(10000);

// Configuração global para testes
// Evitar reasignar `global.console` (provoca advertencias en Jest). En su lugar, crear spies que se restauran automáticamente.
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore && console.log.mockRestore();
  console.warn.mockRestore && console.warn.mockRestore();
  console.error.mockRestore && console.error.mockRestore();
});
