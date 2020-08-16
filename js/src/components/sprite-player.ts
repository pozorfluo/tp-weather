class SpritePlayer extends HTMLElement {

  static _template: DocumentFragment = (() => {
    const t = document.createElement('template');
    t.innerHTML=`\
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

  _running = true;

  css : CSSStyleDeclaration;

  static get observedAttributes() {
    return ['width', 'height', 'anim', 'duration', 'frames'];
  }

  constructor(){
    super();
    // sets and returns 'this.shadowRoot'
    this.attachShadow({mode: 'open'});
    this.shadowRoot?.appendChild(SpritePlayer._template.cloneNode(true));

    const rules = (<ShadowRoot>this.shadowRoot).styleSheets[0].cssRules[0];
    /** @todo Fix the ugly linter quieting */
    this.css = (<any>rules).style;
  }

  attributeChangedCallback(
    name: string,
    oldValue: number | string | null,
    newValue: number | string | null
  ) :void {
    this.css.setProperty('--'+name, (newValue ?? 0) + '');
  }

  play():void {
    this.css.setProperty('animation-play-state', 'running');
    this._running = true;
  }
  
  pause():void {
    this.css.setProperty('animation-play-state', 'paused');
    this._running = false;
  }

  stop():void {
    this.css.setProperty('animation-play-state', 'paused');
    this._running = false;
  }

  toggle():void {
    const toggle = this._running ? 'paused' : 'running';
    this.css.setProperty('animation-play-state', toggle);
    this._running = !this._running;
  }

  pauseAfter():void {
    this.css.setProperty('animation-iteration-count', '1');
  }

}

customElements.define('sprite-player', SpritePlayer);