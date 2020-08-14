"use strict";
class SpritePlayer extends HTMLElement {
    constructor() {
        var _a;
        super();
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(SpritePlayer._template.cloneNode(true));
        const rules = this.shadowRoot.styleSheets[0].cssRules[0];
        this.css = rules.style;
    }
    static get observedAttributes() {
        return ['anim'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.css.setProperty('--anim', (newValue !== null && newValue !== void 0 ? newValue : 0) + '');
    }
}
SpritePlayer._template = (() => {
    const t = document.createElement('template');
    t.innerHTML = `\
      <style>
      .sprite {
        --width : 24px;
        --height : 32px;
        --frames: 12;
        --anim : 1;
        --y : calc(var(--height) * var(--anim));
        --x : calc(var(--width) * var(--frames));
        --duration: 333ms;
        width: var(--width);
        height: var(--height);
        background-origin: border-box;
        background: url('sprites/link.png') 0px var(--y);
        animation: play var(--duration) steps(var(--frames)) infinite;
      }

      @keyframes play {
        100% { background-position: var(--x) var(--y); }
      }
      </style>
      <div class="sprite"></div>
      `;
    return t.content;
})();
customElements.define('sprite-player', SpritePlayer);
