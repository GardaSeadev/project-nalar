import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock canvas-confetti since jsdom doesn't support canvas
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));
