const template = document.createElement('template');
template.innerHTML =`\
<style>
.loading {
  filter: opacity(50%);
  background: transparent url('icons/spinner.svg') no-repeat scroll center
    center;
  background-blend-mode: multiply;
}
</style>
`

class ImgSpinner extends HTMLImageElement {

  constructor() {
    super();
  }
}

customElements.define('img-spinner', WordCount, { extends: 'img'});