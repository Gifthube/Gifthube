(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /**
   * Global State
   */
  const designState = {
    elements: [],
    selectedId: null,
  };

  const TEXT_TAGS = new Set(['div','section','p','h1','h2','h3','span','button','a','label','header','footer','nav','textarea']);
  const VOID_TAGS = new Set(['img','input']);

  const ELEMENT_TYPES = [
    'div','section','p','h1','h2','span','button','a','img','input','textarea','header','footer','nav'
  ];

  const DEFAULT_DIMENSIONS = {
    default: { width: 180, height: 48 },
    button: { width: 120, height: 40 },
    img: { width: 240, height: 160 },
    input: { width: 240, height: 36 },
    textarea: { width: 280, height: 140 },
  };

  /**
   * Elements
   */
  function generateId() {
    return 'el_' + Math.random().toString(36).slice(2, 9);
  }

  function createDefaultModel(tag) {
    const dims =
      tag === 'button' ? DEFAULT_DIMENSIONS.button :
      tag === 'img' ? DEFAULT_DIMENSIONS.img :
      tag === 'input' ? DEFAULT_DIMENSIONS.input :
      tag === 'textarea' ? DEFAULT_DIMENSIONS.textarea :
      DEFAULT_DIMENSIONS.default;

    const idx = designState.elements.length;
    const x = 40 + (idx % 6) * 24;
    const y = 40 + (idx % 6) * 24;

    return {
      id: generateId(),
      tag,
      attributes: {
        id: '',
        class: '',
        title: '',
        href: '',
        target: '',
        src: '',
        alt: '',
        placeholder: '',
        type: tag === 'input' ? 'text' : '',
        value: '',
      },
      styles: {
        left: x,
        top: y,
        width: dims.width,
        height: dims.height,
        color: '#e6e8ef',
        backgroundColor: tag === 'button' ? '#6ea8fe' : tag === 'div' ? '#2d3446' : 'transparent',
        fontSize: 16,
      },
      text: TEXT_TAGS.has(tag)
        ? (tag === 'button' ? 'Button' : tag === 'a' ? 'Link' : tag === 'textarea' ? '' : 'Text')
        : '',
    };
  }

  /**
   * DOM refs
   */
  const canvas = $('#designCanvas');
  const elementTypeSelect = $('#elementType');
  const addElementBtn = $('#addElementBtn');
  const layersList = $('#layersList');
  const propertiesForm = $('#propertiesForm');
  const propTagSelect = $('#propTag');
  const commonPropsBox = $('#commonProps');
  const specificPropsBox = $('#specificProps');
  const stylePropsBox = $('#styleProps');
  const validationList = $('#validationList');
  const codeOutput = $('#codeOutput');
  const copyCodeBtn = $('#copyCodeBtn');
  const downloadCodeBtn = $('#downloadCodeBtn');
  const openPreviewBtn = $('#openPreviewBtn');
  const livePreview = $('#livePreview');

  /**
   * Utilities
   */
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function selectElement(id) {
    designState.selectedId = id;
    renderAll();
  }

  function getElementById(id) {
    return designState.elements.find(e => e.id === id) || null;
  }

  function updateElement(id, updater) {
    const index = designState.elements.findIndex(e => e.id === id);
    if (index === -1) return;
    const current = designState.elements[index];
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    designState.elements[index] = next;
    renderAll();
  }

  function replaceElement(id, newModel) {
    const index = designState.elements.findIndex(e => e.id === id);
    if (index === -1) return;
    designState.elements[index] = newModel;
    designState.selectedId = newModel.id;
    renderAll();
  }

  function moveElement(id, direction) {
    const idx = designState.elements.findIndex(e => e.id === id);
    if (idx === -1) return;
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= designState.elements.length) return;
    const arr = designState.elements;
    [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
    renderAll();
  }

  function setElementIndex(id, newIndex) {
    const idx = designState.elements.findIndex(e => e.id === id);
    if (idx === -1) return;
    newIndex = clamp(newIndex, 0, designState.elements.length - 1);
    if (newIndex === idx) return;
    const [item] = designState.elements.splice(idx, 1);
    designState.elements.splice(newIndex, 0, item);
    renderAll();
  }

  /**
   * Create element
   */
  function addElement(tag) {
    const model = createDefaultModel(tag);
    designState.elements.push(model);
    designState.selectedId = model.id;
    renderAll();
  }

  /**
   * Rendering
   */
  function renderCanvas() {
    const parent = canvas;
    const allExisting = new Set($$('.node', parent).map(n => n.dataset.elId));

    // Ensure DOM nodes exist and match tag
    for (const el of designState.elements) {
      let node = parent.querySelector(`[data-el-id="${el.id}"]`);
      if (!node || node.tagName.toLowerCase() !== el.tag) {
        if (node) node.remove();
        node = document.createElement(el.tag);
        node.dataset.elId = el.id;
        node.className = 'node';
        node.tabIndex = 0;
        attachNodeEvents(node, el.id);
        parent.appendChild(node);
      }
      allExisting.delete(el.id);

      // Attributes
      setNodeAttributes(node, el);

      // Styles
      const { left, top, width, height, color, backgroundColor, fontSize } = el.styles;
      node.style.left = left + 'px';
      node.style.top = top + 'px';
      node.style.width = width + 'px';
      node.style.height = height + 'px';
      node.style.color = color;
      node.style.backgroundColor = backgroundColor;
      node.style.fontSize = fontSize + 'px';

      // Content
      if (!VOID_TAGS.has(el.tag)) {
        if (el.tag === 'textarea') {
          node.value = el.text;
        } else {
          node.textContent = el.text ?? '';
        }
      } else {
        node.textContent = '';
      }

      // Selection style
      if (designState.selectedId === el.id) node.classList.add('selected');
      else node.classList.remove('selected');
    }

    // Remove nodes that are no longer present
    for (const id of allExisting) {
      const stale = parent.querySelector(`[data-el-id="${id}"]`);
      if (stale) stale.remove();
    }

    // Reorder DOM to match state order
    for (const el of designState.elements) {
      const node = parent.querySelector(`[data-el-id="${el.id}"]`);
      if (node && node.nextSibling !== null) {
        parent.appendChild(node);
      }
    }
  }

  function setNodeAttributes(node, el) {
    const a = el.attributes;
    // Clear possible previous attributes
    const keep = new Set(['class','style','tabindex','data-el-id']);
    for (const attr of Array.from(node.attributes)) {
      if (!keep.has(attr.name)) node.removeAttribute(attr.name);
    }
    if (a.id) node.setAttribute('id', a.id);
    node.className = `node ${a.class || ''}`.trim();
    if (a.title) node.setAttribute('title', a.title);
    if (el.tag === 'a') {
      if (a.href) node.setAttribute('href', a.href);
      if (a.target) node.setAttribute('target', a.target);
    }
    if (el.tag === 'img') {
      if (a.src) node.setAttribute('src', a.src);
      if (a.alt) node.setAttribute('alt', a.alt);
      // Prevent broken icon size collapse
      node.setAttribute('draggable', 'false');
    }
    if (el.tag === 'input') {
      node.setAttribute('type', a.type || 'text');
      if (a.placeholder) node.setAttribute('placeholder', a.placeholder);
      if (a.value) node.setAttribute('value', a.value);
    }
    if (el.tag === 'textarea') {
      node.setAttribute('placeholder', a.placeholder || '');
    }
  }

  function renderLayers() {
    layersList.innerHTML = '';
    designState.elements.forEach((el, index) => {
      const li = document.createElement('li');
      li.className = 'layer-item' + (designState.selectedId === el.id ? ' active' : '');

      const nameBtn = document.createElement('div');
      nameBtn.className = 'layer-name';
      nameBtn.textContent = `${index + 1}. <${el.tag}>` + (el.attributes.id ? `#${el.attributes.id}` : '');
      nameBtn.addEventListener('click', () => selectElement(el.id));

      const actions = document.createElement('div');
      actions.className = 'layer-actions';
      const up = document.createElement('button');
      up.textContent = 'Up';
      up.title = 'Move up';
      up.addEventListener('click', () => moveElement(el.id, 'up'));
      const down = document.createElement('button');
      down.textContent = 'Down';
      down.title = 'Move down';
      down.addEventListener('click', () => moveElement(el.id, 'down'));
      actions.appendChild(up);
      actions.appendChild(down);

      li.appendChild(nameBtn);
      li.appendChild(actions);
      layersList.appendChild(li);
    });
  }

  function renderProperties() {
    // Populate tag select
    propTagSelect.innerHTML = '';
    for (const tag of ELEMENT_TYPES) {
      const opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = tag;
      propTagSelect.appendChild(opt);
    }

    const el = getElementById(designState.selectedId);
    if (!el) {
      propertiesForm.classList.add('disabled');
      commonPropsBox.innerHTML = '';
      specificPropsBox.innerHTML = '';
      stylePropsBox.innerHTML = '';
      validationList.innerHTML = '';
      propTagSelect.value = '';
      return;
    }
    propertiesForm.classList.remove('disabled');
    propTagSelect.value = el.tag;

    // Common props
    commonPropsBox.innerHTML = '';
    commonPropsBox.appendChild(row('id', input('text', el.attributes.id, (v) => updateAttr(el.id, 'id', v))));
    commonPropsBox.appendChild(row('class', input('text', el.attributes.class, (v) => updateAttr(el.id, 'class', v))));
    commonPropsBox.appendChild(row('title', input('text', el.attributes.title, (v) => updateAttr(el.id, 'title', v))));

    // Content or value
    if (TEXT_TAGS.has(el.tag) && el.tag !== 'textarea') {
      commonPropsBox.appendChild(row('text', input('text', el.text, (v) => updateText(el.id, v))));
    }
    if (el.tag === 'textarea') {
      commonPropsBox.appendChild(row('text', textarea(el.text, (v) => updateText(el.id, v))));
      commonPropsBox.appendChild(row('placeholder', input('text', el.attributes.placeholder, (v) => updateAttr(el.id, 'placeholder', v))));
    }

    // Specific props
    specificPropsBox.innerHTML = '';
    if (el.tag === 'a') {
      specificPropsBox.appendChild(row('href', input('text', el.attributes.href, (v) => updateAttr(el.id, 'href', v))));
      specificPropsBox.appendChild(row('target', select(['','_blank','_self','_parent','_top'], el.attributes.target, (v) => updateAttr(el.id, 'target', v))));
    }
    if (el.tag === 'img') {
      specificPropsBox.appendChild(row('src', input('text', el.attributes.src, (v) => updateAttr(el.id, 'src', v))));
      specificPropsBox.appendChild(row('alt', input('text', el.attributes.alt, (v) => updateAttr(el.id, 'alt', v))));
    }
    if (el.tag === 'input') {
      specificPropsBox.appendChild(row('type', select(['text','email','number','password','search','url','tel','date','color'], el.attributes.type || 'text', (v) => updateAttr(el.id, 'type', v))));
      specificPropsBox.appendChild(row('placeholder', input('text', el.attributes.placeholder, (v) => updateAttr(el.id, 'placeholder', v))));
      specificPropsBox.appendChild(row('value', input('text', el.attributes.value, (v) => updateAttr(el.id, 'value', v))));
    }

    // Styles
    stylePropsBox.innerHTML = '';
    stylePropsBox.appendChild(row('left', input('number', el.styles.left, (v) => updateStyle(el.id, 'left', toNumber(v)), 'px')));
    stylePropsBox.appendChild(row('top', input('number', el.styles.top, (v) => updateStyle(el.id, 'top', toNumber(v)), 'px')));
    stylePropsBox.appendChild(row('width', input('number', el.styles.width, (v) => updateStyle(el.id, 'width', toNumber(v)), 'px')));
    stylePropsBox.appendChild(row('height', input('number', el.styles.height, (v) => updateStyle(el.id, 'height', toNumber(v)), 'px')));
    stylePropsBox.appendChild(row('fontSize', input('number', el.styles.fontSize, (v) => updateStyle(el.id, 'fontSize', toNumber(v)), 'px')));
    stylePropsBox.appendChild(row('color', input('color', el.styles.color, (v) => updateStyle(el.id, 'color', v))));
    stylePropsBox.appendChild(row('background', input('color', el.styles.backgroundColor || '#00000000', (v) => updateStyle(el.id, 'backgroundColor', v))));

    renderValidation(el);
  }

  function toNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function updateAttr(id, name, value) {
    updateElement(id, (el) => ({ ...el, attributes: { ...el.attributes, [name]: value } }));
  }

  function updateText(id, value) {
    updateElement(id, (el) => ({ ...el, text: value }));
  }

  function updateStyle(id, name, value) {
    updateElement(id, (el) => ({ ...el, styles: { ...el.styles, [name]: value } }));
  }

  function renderValidation(el) {
    const issues = [];
    if (el.tag === 'img' && !el.attributes.src) issues.push('img requires a src attribute');
    if (el.tag === 'a' && !el.attributes.href) issues.push('anchor <a> is missing href');
    if (el.tag === 'input' && !el.attributes.type) issues.push('input type defaults to text');
    validationList.innerHTML = '';
    for (const issue of issues) {
      const li = document.createElement('li');
      li.textContent = issue;
      validationList.appendChild(li);
    }
  }

  function renderCode() {
    const html = generateHTMLDocument();
    codeOutput.value = html;
    // Live preview via srcdoc
    if ('srcdoc' in livePreview) {
      livePreview.srcdoc = html;
    } else {
      // Fallback
      const blob = new Blob([html], { type: 'text/html' });
      livePreview.src = URL.createObjectURL(blob);
    }
  }

  function generateHTMLDocument() {
    const lines = [];
    lines.push('<!doctype html>');
    lines.push('<html lang="en">');
    lines.push('  <head>');
    lines.push('    <meta charset="utf-8">');
    lines.push('    <meta name="viewport" content="width=device-width, initial-scale=1">');
    lines.push('    <title>Generated by Design Studio</title>');
    lines.push('    <style>');
    lines.push('      html,body{height:100%} body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}');
    lines.push('      #root{position:relative;min-height:100vh;background:#ffffff}');
    lines.push('      .node{position:absolute;display:flex;align-items:center;justify-content:center;box-sizing:border-box}');
    lines.push('      a.node{color:#0b57d0} button.node{border:1px solid #d0d7de;border-radius:6px;cursor:pointer}');
    lines.push('      input.node,textarea.node{border:1px solid #d0d7de;border-radius:6px;padding:6px 8px}');
    lines.push('    </style>');
    lines.push('  </head>');
    lines.push('  <body>');
    lines.push('    <div id="root">');
    for (const el of designState.elements) {
      lines.push('      ' + serializeElement(el));
    }
    lines.push('    </div>');
    lines.push('  </body>');
    lines.push('</html>');
    return lines.join('\n');
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function serializeElement(el) {
    const { left, top, width, height, color, backgroundColor, fontSize } = el.styles;
    const style = [
      `left:${left}px`,
      `top:${top}px`,
      `width:${width}px`,
      `height:${height}px`,
      `color:${color}`,
      `background:${backgroundColor}`,
      `font-size:${fontSize}px`,
    ].join(';');

    const attrs = [];
    if (el.attributes.id) attrs.push(`id="${escapeHtml(el.attributes.id)}"`);
    const className = ['node', el.attributes.class].filter(Boolean).join(' ');
    attrs.push(`class="${escapeHtml(className)}"`);
    if (el.attributes.title) attrs.push(`title="${escapeHtml(el.attributes.title)}"`);
    if (el.tag === 'a') {
      if (el.attributes.href) attrs.push(`href="${escapeHtml(el.attributes.href)}"`);
      if (el.attributes.target) attrs.push(`target="${escapeHtml(el.attributes.target)}"`);
    }
    if (el.tag === 'img') {
      if (el.attributes.src) attrs.push(`src="${escapeHtml(el.attributes.src)}"`);
      if (el.attributes.alt) attrs.push(`alt="${escapeHtml(el.attributes.alt)}"`);
    }
    if (el.tag === 'input') {
      attrs.push(`type="${escapeHtml(el.attributes.type || 'text')}"`);
      if (el.attributes.placeholder) attrs.push(`placeholder="${escapeHtml(el.attributes.placeholder)}"`);
      if (el.attributes.value) attrs.push(`value="${escapeHtml(el.attributes.value)}"`);
    }
    if (el.tag === 'textarea') {
      if (el.attributes.placeholder) attrs.push(`placeholder="${escapeHtml(el.attributes.placeholder)}"`);
    }

    attrs.push(`style="${escapeHtml(style)}"`);

    if (VOID_TAGS.has(el.tag)) {
      return `<${el.tag} ${attrs.join(' ')} />`;
    }
    if (el.tag === 'textarea') {
      return `<textarea ${attrs.join(' ')}>${escapeHtml(el.text || '')}</textarea>`;
    }
    return `<${el.tag} ${attrs.join(' ')}>${escapeHtml(el.text || '')}</${el.tag}>`;
  }

  /**
   * Events & Interaction
   */
  let drag = null;
  function attachNodeEvents(node, id) {
    node.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const el = getElementById(id);
      if (!el) return;
      selectElement(id);
      node.setPointerCapture(e.pointerId);
      drag = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: el.styles.left,
        origTop: el.styles.top,
      };
    });
    node.addEventListener('dblclick', () => {
      // Quick focus to properties input for text if available
      const textInput = $(`#commonProps input[type="text"]`);
      if (textInput) textInput.focus();
    });
  }

  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const id = drag.id;
    updateStyle(id, 'left', Math.round(drag.origLeft + dx));
    updateStyle(id, 'top', Math.round(drag.origTop + dy));
  });

  window.addEventListener('pointerup', () => {
    drag = null;
  });

  canvas.addEventListener('pointerdown', (e) => {
    if (e.target === canvas) {
      selectElement(null);
    }
  });

  window.addEventListener('keydown', (e) => {
    const el = getElementById(designState.selectedId);
    if (!el) return;
    let handled = false;
    if (e.key === 'ArrowLeft') { updateStyle(el.id, 'left', el.styles.left - 1); handled = true; }
    if (e.key === 'ArrowRight') { updateStyle(el.id, 'left', el.styles.left + 1); handled = true; }
    if (e.key === 'ArrowUp') { updateStyle(el.id, 'top', el.styles.top - 1); handled = true; }
    if (e.key === 'ArrowDown') { updateStyle(el.id, 'top', el.styles.top + 1); handled = true; }
    if (handled) e.preventDefault();
  });

  propTagSelect.addEventListener('change', () => {
    const el = getElementById(designState.selectedId);
    if (!el) return;
    const newTag = propTagSelect.value;
    if (!newTag || newTag === el.tag) return;
    const next = migrateTag(el, newTag);
    replaceElement(el.id, next);
  });

  addElementBtn.addEventListener('click', () => {
    const tag = elementTypeSelect.value || 'div';
    addElement(tag);
  });

  copyCodeBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeOutput.value);
      copyCodeBtn.textContent = 'Copied!';
      setTimeout(() => (copyCodeBtn.textContent = 'Copy'), 1200);
    } catch (e) {
      console.warn('Clipboard failed, selecting instead');
      codeOutput.select();
    }
  });

  downloadCodeBtn.addEventListener('click', () => {
    const blob = new Blob([codeOutput.value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  openPreviewBtn.addEventListener('click', () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(codeOutput.value);
      w.document.close();
    }
  });

  function migrateTag(el, newTag) {
    const keep = { ...el.attributes };
    const next = createDefaultModel(newTag);
    // Keep id, class, title, position, size
    next.attributes.id = keep.id || '';
    next.attributes.class = keep.class || '';
    next.attributes.title = keep.title || '';
    next.styles.left = el.styles.left;
    next.styles.top = el.styles.top;
    next.styles.width = el.styles.width;
    next.styles.height = el.styles.height;
    next.styles.color = el.styles.color;
    next.styles.backgroundColor = el.styles.backgroundColor;
    next.styles.fontSize = el.styles.fontSize;
    // Map content and special attributes where sensible
    if (TEXT_TAGS.has(newTag) && !VOID_TAGS.has(newTag)) {
      next.text = el.text || '';
    }
    if (newTag === 'a') {
      next.attributes.href = keep.href || '';
      next.attributes.target = keep.target || '';
      if (!next.text) next.text = 'Link';
    }
    if (newTag === 'img') {
      next.attributes.src = keep.src || '';
      next.attributes.alt = keep.alt || '';
    }
    if (newTag === 'input') {
      next.attributes.type = keep.type || 'text';
      next.attributes.placeholder = keep.placeholder || '';
      next.attributes.value = keep.value || '';
    }
    return next;
  }

  /**
   * Form UI helpers
   */
  function row(labelText, control, suffixText) {
    const wrapper = document.createElement('div');
    wrapper.className = 'row';
    const label = document.createElement('label');
    label.textContent = labelText;
    wrapper.appendChild(label);
    const ctrlWrap = document.createElement('div');
    ctrlWrap.appendChild(control);
    if (suffixText) {
      const suffix = document.createElement('span');
      suffix.textContent = suffixText;
      suffix.style.marginLeft = '6px';
      ctrlWrap.appendChild(suffix);
    }
    wrapper.appendChild(ctrlWrap);
    return wrapper;
  }

  function input(type, value, onChange) {
    const el = document.createElement('input');
    el.type = type;
    if (type === 'number') el.step = '1';
    el.value = value == null ? '' : String(value);
    el.addEventListener('input', () => onChange(el.value));
    return el;
  }

  function textarea(value, onChange) {
    const el = document.createElement('textarea');
    el.value = value == null ? '' : String(value);
    el.rows = 3;
    el.addEventListener('input', () => onChange(el.value));
    return el;
  }

  function select(options, value, onChange) {
    const el = document.createElement('select');
    for (const opt of options) {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt || '(none)';
      el.appendChild(o);
    }
    el.value = value == null ? '' : String(value);
    el.addEventListener('change', () => onChange(el.value));
    return el;
  }

  function renderAll() {
    renderCanvas();
    renderLayers();
    renderProperties();
    renderCode();
  }

  function init() {
    // Populate element type select
    elementTypeSelect.innerHTML = '';
    for (const tag of ELEMENT_TYPES) {
      const opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = tag;
      elementTypeSelect.appendChild(opt);
    }
    renderAll();
  }

  init();
})();

