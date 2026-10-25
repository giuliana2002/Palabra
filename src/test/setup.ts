import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom no implementa el scroll.
window.scrollTo = () => {};
Element.prototype.scrollIntoView = () => {};
