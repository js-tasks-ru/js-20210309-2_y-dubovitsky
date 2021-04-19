export default class App {

  static instance;

  constructor(defaultPage = 'about') {

    if(!App.instance) {
      this.defaultPage = defaultPage;
      
      App.instance = this;
      this.#initialize();
    }
    return App.instance;
  }

  async #initialize() { // Private method! invoke one time by creating instance of class!
    this.getSubElements();
    this.initEventListeners();
    
    this.setPageContent(this.defaultPage);
  }

  changeContent = (event) => {
    const link = event.target.closest('a');

    if(link) {
      event.preventDefault();
      
      const href = link.getAttribute('href');
      history.pushState(null, null, href);
      this.setPageContent(href);
    }
  }

  async setPageContent(href) {
    const className = await this.getClassByName(href);

    const instance = new className();

    if(this.content.firstElementChild) {
      this.content.firstElementChild.remove();
    }

    this.content.append(instance.element);
  }

  async getClassByName(name) {
    const path = name.replace('/', '');
    let module;

    try {
      module = await import(`./external/${path}.js`);
    } catch {
      module = await import(`./external/notfound.js`);
    }
    const className = module.default; //TODO improve?

    return className;
  }

  initEventListeners() {
    document.addEventListener('click', this.changeContent);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('click', this.changeContent);
  }

  // -------------------------- Utils methods --------------------------

  getSubElements() {
    this.content = document.querySelector('#content');
  }

}
