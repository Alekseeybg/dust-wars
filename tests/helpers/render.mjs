import { createRenderer, h, reactive } from 'vue';

// A small host for interaction tests. These checks exercise Vue's real
// reactivity and event handlers; they do not measure browser layout.
function node(type, text = '') {
  return { type, text, children: [], props: {}, parent: null };
}

const renderer = createRenderer({
  createElement: (type) => node(type),
  createText: (text) => node('text', text),
  createComment: (text) => node('comment', text),
  setText: (target, text) => {
    target.text = text;
  },
  setElementText: (target, text) => {
    target.text = text;
    target.children = [];
  },
  patchProp: (target, key, _previous, value) => {
    target.props[key] = value;
  },
  parentNode: (target) => target.parent,
  nextSibling: (target) =>
    target.parent?.children[target.parent.children.indexOf(target) + 1] ?? null,
  insert(target, parent, anchor = null) {
    if (target.parent) {
      target.parent.children.splice(target.parent.children.indexOf(target), 1);
    }
    target.parent = parent;
    const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
    parent.children.splice(index, 0, target);
  },
  remove(target) {
    target.parent?.children.splice(target.parent.children.indexOf(target), 1);
    target.parent = null;
  },
});

export function mount(component, initialProps) {
  const props = reactive(initialProps);
  const root = node('root');
  const app = renderer.createApp({ render: () => h(component, props) });
  app.mount(root);
  return { props, root, unmount: () => app.unmount() };
}

export function findAll(root, predicate) {
  return [
    ...(predicate(root) ? [root] : []),
    ...root.children.flatMap((child) => findAll(child, predicate)),
  ];
}

export function textOf(target) {
  return target.text + target.children.map(textOf).join('');
}

export function button(root, text) {
  const match = findAll(
    root,
    (target) => target.type === 'button' && textOf(target).trim().startsWith(text),
  )[0];
  if (!match) throw new Error(`Button not found: ${text}`);
  return match;
}
