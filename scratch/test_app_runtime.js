const fs = require('fs');

// Mock browser globals
const elements = {};
function createElement(tag, id) {
  const el = {
    tagName: tag.toUpperCase(),
    id: id || '',
    className: '',
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      toggle(c, force) { 
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
        } else if (force) this._classes.add(c); else this._classes.delete(c);
      },
      contains(c) { return this._classes.has(c); }
    },
    style: {
      setProperty() {},
      display: 'block'
    },
    querySelectorAll() { return []; },
    appendChild() {},
    innerHTML: '',
    addEventListener() {}
  };
  return el;
}

const mockDoc = {
  getElementById(id) {
    if (!elements[id]) {
      elements[id] = createElement('div', id);
    }
    return elements[id];
  },
  querySelectorAll() { return []; },
  createElement(tag) { return createElement(tag); },
  addEventListener() {},
  body: createElement('body')
};

global.window = {
  addEventListener() {},
  AudioContext: function() {
    return {
      currentTime: 0,
      sampleRate: 44100,
      state: 'running',
      resume() {},
      createBuffer(ch, len, sr) {
        return { getChannelData() { return new Float32Array(len); } };
      },
      createBufferSource() {
        return { buffer: null, connect() {}, start() {}, stop() {} };
      },
      createBiquadFilter() {
        return { type: '', frequency: { setValueAtTime() {} }, Q: { setValueAtTime() {} }, connect() {} };
      },
      createGain() {
        return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }, connect() {} };
      },
      createOscillator() {
        return { type: '', frequency: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} };
      },
      destination: {}
    };
  }
};
global.document = mockDoc;
global.setTimeout = (fn, delay) => { fn(); return 1; };
global.clearTimeout = () => {};
global.setInterval = () => 1;
global.clearInterval = () => {};
global.requestAnimationFrame = (fn) => fn();

try {
  const code = fs.readFileSync('scratch/extracted_app.js', 'utf8');
  eval(code);
  console.log("App evaluated successfully!");

  console.log("Testing goToSp5Slide(4)...");
  goToSp5Slide(4);
  console.log("goToSp5Slide(4) executed cleanly!");

  console.log("Testing triggerGrandCollabReveal()...");
  triggerGrandCollabReveal();
  console.log("triggerGrandCollabReveal() executed cleanly!");
  console.log("Curtain opened class:", elements['collab-curtains-wrap'].classList.contains('opened'));
} catch (err) {
  console.error("RUNTIME ERROR:", err);
}
