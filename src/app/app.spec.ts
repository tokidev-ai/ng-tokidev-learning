import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('debe existir la clase principal de la aplicación', () => {
    expect(App).toBeDefined();
  });
});
