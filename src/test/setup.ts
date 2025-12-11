import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock canvas-confetti since jsdom doesn't support canvas
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

// Mock matchMedia for react-hot-toast
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
