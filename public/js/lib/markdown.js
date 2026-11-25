// Safe light-markdown renderer. Builds DOM with el(); never uses innerHTML.
import { el } from '../core.js';

// inline: **bold** only
export function renderInline(text) {
  const out = [];
  const parts = String(text ?? '').split(/(\*\*[^*]+\*\*)/g);
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) out.push(el('strong', {}, p.slice(2, -2)));
    else out.push(p);
  }
  return out;
}

export function renderMarkdown(src, cls = 'md') {
  const root = el('div', { class: cls });
  const blocks = String(src ?? '').replace(/\r\n?/g, '\n').split(/\n{2,}/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split('\n');
    let para = [];
    let list = null;
    const flushPara = () => {
      if (para.length) {
        const kids = [];
        para.forEach((l, i) => { if (i) kids.push(el('br')); kids.push(...renderInline(l)); });
        root.append(el('p', {}, kids));
        para = [];
      }
    };
    const flushList = () => { if (list) { root.append(list); list = null; } };
    for (const line of lines) {
      const h = line.match(/^(#{2,3})\s+(.*)$/);
      const li = line.match(/^\s*[-*]\s+(.*)$/);
      if (h) {
        flushPara(); flushList();
        root.append(el(h[1].length === 2 ? 'h2' : 'h3', {}, renderInline(h[2])));
      } else if (li) {
        flushPara();
        if (!list) list = el('ul', {});
        list.append(el('li', {}, renderInline(li[1])));
      } else {
        flushList();
        para.push(line.trim());
      }
    }
    flushPara(); flushList();
  }
  return root;
}
