import { LitElement,css, html } from 'lit-element';

class WebComponent extends LitElement {
  static get properties() {
    return { name: { type: String } };
  }

  constructor() {
    super();
    this.name = 'World';
  }

    static get styles() {
        return css`
        
        #content{
        color:red;
        
        }

    `;
    }


  render() {
    return html`
        Hello <span id="content">${this.name}</span>!
`;
  }

    firstUpdated() {

    }




}

customElements.define('web-component', WebComponent);
