// Run the project's TypeScript modules in Node without a separate test bundler.
import { readFileSync, existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parse, compileScript } from 'vue/compiler-sfc';

const sourceRoot = new URL('../src/', import.meta.url);
const aliases = new Set(['data', 'domain', 'services', 'stores', 'types', 'utils']);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const [alias] = specifier.split('/');
    let url;
    if (alias === 'src') url = new URL(specifier.slice(4), sourceRoot);
    else if (aliases.has(alias)) url = new URL(specifier, sourceRoot);
    else if (specifier.startsWith('.') && context.parentURL?.startsWith(sourceRoot.href)) {
      url = new URL(specifier, context.parentURL);
    }
    if (url) {
      for (const suffix of ['.ts', '/index.ts']) {
        const candidate = new URL(url.href + suffix);
        if (existsSync(candidate)) return { url: candidate.href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot.href) && /\.(ts|vue)$/.test(url)) {
      let source = readFileSync(new URL(url), 'utf8');
      if (url.endsWith('.vue')) {
        const { descriptor } = parse(source, { filename: fileURLToPath(url) });
        source = compileScript(descriptor, { id: url, inlineTemplate: true }).content;
      }
      const { outputText } = ts.transpileModule(source, {
        fileName: fileURLToPath(url),
        compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
      });
      return { format: 'module', source: outputText, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
