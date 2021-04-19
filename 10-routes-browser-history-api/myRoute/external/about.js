export default class About {

  constructor(name = 'About') {
    this.name = name;
    this.render()
  }

  getTemplate() {
    return `
            <div>
              <h2>${this.name} page!</h2>
              <p style="color: red">Lipsum dolor sit amet consectetur, adipisicing elit. Repellat, eum?></p>
            </div>
            `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }
}