export default class News {

  constructor(name = 'News') {
    this.name = name;
    this.render()
  }

  getTemplate() {
    return `
            <div>
            <h1>${this.name} page!</h1>
              <div>
                <h2>
                  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, asperiores.</p>
                </h2>
                <h2>
                  <p>Veniam perspiciatis pariatur quam soluta aspernatur, ea assumenda non repellat?</p>
                </h2>
                <h2>
                  <p>Esse cumque explicabo sunt tempora officia, numquam dolore dolores harum?</p>
                </h2>
              </div>
            </div>
            `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }
}