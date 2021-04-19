export default class NotFound {

  constructor(name = 'Name of Page') {
    this.name = name;
    this.render()
  }

  getTemplate() {
    return `
            <div>
              <h1>Page not found</h1>
            </div>
            `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }
}