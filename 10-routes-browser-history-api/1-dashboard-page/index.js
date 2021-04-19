import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  /**
   * Class fields
   */
  pageComponents;
  subElements;
  element;

  /**
   * Create all components
   */
  createComponents() {

    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth() - 1)

    const sortableTable = new SortableTable(
      header,
      {
        url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`,
      }
    );

    const rangePicker = new RangePicker({
      from,
      to
    });

    const chartComponents = (() => { // This function create 3 objects of ColumnChart
      const titles = ['orders', 'sales', 'customers'];

      const chartComponents = titles.reduce((accum, current) => {
        accum[current] = new ColumnChart({
          url: `api/dashboard/${current}`,
          label: `${current}`,
          range: {
            from,
            to
          }
        });

        return accum;
      }, {})

      return chartComponents;
    })();

    this.pageComponents = {
      sortableTable,
      ...chartComponents,
      rangePicker
    }
  }

  async updateComponents (from, to) {
    const data = await fetchJson(`${BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=21&from=${from.toISOString()}&to=${to.toISOString()}&_sort=title&_order=asc`);
    this.pageComponents.sortableTable.addRows(data);

    this.pageComponents.orders.update(from, to);
    this.pageComponents.sales.update(from, to);
    this.pageComponents.customers.update(from, to);
  }

  getTemplate() {
    return `
            <div class="dashboard full-height flex-column">
              <div class="content__top-panel">
                <h2 class="page-title">Панель управления</h2>
                <div data-element="rangePicker">
                </div>
              </div>
              <div class="dashboard__charts">
                <div data-element="orders" class="dashboard__chart_orders"></div>
                <div data-element="sales" class="dashboard__chart_sales"></div>
                <div data-element="customers" class="dashboard__chart_customers"></div>
              </div>
              <h3 class="block-title">Лидеры продаж</h3>
              <div data-element="sortableTable">
              </div>
            </div>
            `
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.getSubElements(this.element);
    this.createComponents();
    this.createPageContent(this.element);
    this.initEventListeners();


    return this.element;
  }

  /**
   * Этот метод ищет в шаблоне места для вставки компонентов и заменяет элементы пустышки на компоненты
   */
  createPageContent(templateElement) {
    for (let key in this.subElements) {
      const placeholder = templateElement.querySelector(`[data-element=${key}]`);
      const parent = placeholder.parentNode;
      parent.replaceChild(this.pageComponents[key].element, placeholder);
    }
  }

  // Events and Listeners
  initEventListeners () {
    this.pageComponents.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  // -------------------------- Utils methods --------------------------
  getSubElements(element) {
    const dataElements = element.querySelectorAll('[data-element]');

    this.subElements = Array.from(dataElements).reduce((accum, current) => {
      const name = current.dataset.element;

      accum[name] = current;
      return accum;
    }, {})
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for(let key in this.pageComponents) {
      this.pageComponents[key].destroy();
    }

    this.pageComponents = null;
  }

}
