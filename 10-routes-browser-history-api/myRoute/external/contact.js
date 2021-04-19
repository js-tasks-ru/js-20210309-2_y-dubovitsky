export default class Contact {

  constructor(name = 'Contact') {
    this.name = name;
    this.render()
  }

  getTemplate() {
    return `
            <div>
              <h2>${this.name} page!</h2>
              <ul style="color: green">
                <li>Lorem ipsum dolor sit amet.</li>
                <li>Inventore quos magni facilis molestias.</li>
                <li>Ab laudantium neque ex impedit?</li>
              </ul>
            </div>
            `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }
}