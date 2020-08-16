"use strict";
class SpritePlayer extends HTMLElement {
    constructor() {
        var _a;
        super();
        this._running = true;
        this.attachShadow({ mode: 'open' });
        (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.appendChild(SpritePlayer._template.cloneNode(true));
        const rules = this.shadowRoot.styleSheets[0].cssRules[0];
        this.css = rules.style;
    }
    static get observedAttributes() {
        return ['width', 'height', 'anim', 'duration', 'frames'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.css.setProperty('--' + name, (newValue !== null && newValue !== void 0 ? newValue : 0) + '');
    }
    play() {
        this.css.setProperty('animation-play-state', 'running');
        this._running = true;
    }
    pause() {
        this.css.setProperty('animation-play-state', 'paused');
        this._running = false;
    }
    stop() {
        this.css.setProperty('animation-play-state', 'paused');
        this._running = false;
    }
    toggle() {
        const toggle = this._running ? 'paused' : 'running';
        this.css.setProperty('animation-play-state', toggle);
        this._running = !this._running;
    }
    pauseAfter() {
        this.css.setProperty('animation-iteration-count', '1');
    }
}
SpritePlayer._template = (() => {
    const t = document.createElement('template');
    t.innerHTML = `\
      <style>
      .sprite {
        --width : 64px;
        --height : 64px;
        --frames: 12;
        --anim : 0;
        --y : calc(var(--height) * var(--anim) * -1);
        --x : calc(var(--width) * var(--frames) * -1);
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
