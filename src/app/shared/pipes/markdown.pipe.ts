import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';

    let html = value;

    // Escapar etiquetas HTML básicas para evitar XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bloques de código (```ts ... ```)
    html = html.replace(/```(?:[a-zA-Z]+)?\n([\s\S]*?)```/g, (_match, code) => {
      return `<pre class="p-3.5 my-2.5 rounded-xl bg-slate-950 border border-white/10 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed shadow-inner"><code>${code.trim()}</code></pre>`;
    });

    // Código en línea (`codigo`)
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900 border border-white/10 text-[#FA743F] font-mono text-[11px] font-bold">$1</code>');

    // Encabezados H3 (### Título)
    html = html.replace(/^### (.*$)/gim, '<h4 class="text-xs md:text-sm font-extrabold text-[#FA743F] mt-3.5 mb-1.5 tracking-wider uppercase flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-[#FA743F]"></span>$1</h4>');

    // Encabezados H2 (## Título)
    html = html.replace(/^## (.*$)/gim, '<h3 class="text-sm md:text-base font-black text-white mt-4 mb-2 tracking-wide border-b border-white/10 pb-1.5 text-[#DA2984] flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#DA2984]"></span>$1</h3>');

    // Encabezados H1 (# Título)
    html = html.replace(/^# (.*$)/gim, '<h2 class="text-base md:text-lg font-black text-white mt-5 mb-2.5">$1</h2>');

    // Negrita (**texto**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-white">$1</strong>');

    // Cursiva (*texto*)
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-200">$1</em>');

    // Enlaces [texto](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#A406E9] hover:text-[#DA2984] underline font-bold transition-colors">$1</a>');

    // Listas con viñetas (• elemento o - elemento o * elemento)
    html = html.replace(/^[•\-\*]\s*(.*$)/gim, '<li class="flex items-start gap-2 text-slate-300 py-0.5 leading-snug"><span class="text-[#A406E9] font-black shrink-0 leading-tight">•</span><span class="leading-relaxed">$1</span></li>');

    // Envolver bloques de <li> contiguos en <ul> eliminando saltos de línea internos
    html = html.replace(/(?:<li[\s\S]*?<\/li>(?:\s*\n*)*)+/g, (match) => {
      const cleanItems = match.replace(/\r?\n+/g, '').trim();
      return `<ul class="space-y-1.5 my-2 pl-1">${cleanItems}</ul>`;
    });

    // Saltos de línea para párrafos normales
    html = html
      .replace(/\n\n/g, '<div class="h-2.5"></div>')
      .replace(/\n/g, '<br>');

    // Limpiar <br> sobrantes adyacentes a elementos de bloque y dentro de listas
    html = html
      .replace(/(<\/ul>|<\/h[1-4]>|<\/pre>|<div class="h-2.5"><\/div>)<br>/g, '$1')
      .replace(/<br>(<ul|<h[1-4]|<pre|<div class="h-2.5">)/g, '$1')
      .replace(/<ul([^>]*)><br>/g, '<ul$1>')
      .replace(/<br><\/ul>/g, '</ul>')
      .replace(/<\/li><br>/g, '</li>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
