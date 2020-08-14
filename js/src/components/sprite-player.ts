class SpritePlayer extends HTMLElement {

  static _template: DocumentFragment = (() => {
    const t = document.createElement('template');
    t.innerHTML=`\
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

  css : CSSStyleDeclaration;
  // width : string;
  // anim : number;

  static get observedAttributes() {
    return ['anim'];
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
  ) {
    this.css.setProperty('--anim', (newValue ?? 0) + '');
  }
}

customElements.define('sprite-player', SpritePlayer);