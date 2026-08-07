import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#0B0A17] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <app-navbar></app-navbar>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Global Footer -->
      <footer class="border-t border-white/5 bg-[#080712] py-8 px-4 text-center text-xs text-slate-500">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-slate-300">TokiDev.ai Learning</span>
            <span>— Plataforma E-Learning Multi-Rol</span>
          </div>
          <div class="flex items-center gap-4 text-slate-400">
            <a href="#" class="hover:text-white transition-colors">Términos</a>
            <a href="#" class="hover:text-white transition-colors">Privacidad</a>
            <a href="#" class="hover:text-white transition-colors font-bold text-[#A406E9]">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class App {}
