import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class SortableTable {

  constructor(
    header = [],
    { url = '' }
  ) {
    this.header = header;
    this.url = url;
    this.data = [];
    this.isLoading = false;
    this.isSortLocally = false;
    this.searchParams = {
      _embed: 'subcategory.category',
      _sort: 'title',
      _order: 'asc',
      _start: 0,
      _end: 30,
    }

    this.render();
  }

  getUrl(params) {
    const url = new URL(this.url, BACKEND_URL)
    for (let key in params) {
      url.searchParams.set(key, params[key])
    }

    return url;
  }

  changeLoadingState() {
    this.isLoading = !this.isLoading;
  }

  changeSearchParams(newParams) {
    Object.assign(this.searchParams, newParams);
  }

  toggleLoader() {
    const loader = this.subElements.loader;
    this.isLoading ? loader.style.visibility = "hidden" : loader.style.visibility = "";
  }

  async loadData() {
    const result = await fetchJson(this.getUrl(this.searchParams));
    if (!result || result.lenght === 0) {
      alert('Wrong Url Request')
    }
    this.data = this.data.concat(result); //FIXME Не делать так?
  }

  async update() {
    this.toggleLoader();
    await this.loadData();
    const body = this.subElements.body;
    body.innerHTML = this.getTableBody(this.data, this.header);
    this.changeLoadingState();
    this.toggleLoader();
  }

  // Header
  getTableHeader(header) {
    return `
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${header.map(item => getHeaderCell(item)).join('')}
          </div>
            `

    function getHeaderCell({ id, title, sortable }) {
      return `
            <div class="sortable-table__cell" data-id="${id}" data-name="${title}" data-sortable="${sortable}" data-order="asc">
            <span>${title}</span>
            ${sortable ?
        `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>`
        : ''
      }
            </div>
            `
    }
  }

  // TableBody
  getTableBody(data = [], header = this.header) {

    return `
              ${data.map(element => getTableRow(element, header)).join('')}
            `

    function getTableRow(element, header) {
      return `
            <a href="/products/${element.id}" class="sortable-table__row">
              ${header.map(head => {
        return head.template ? head.template(element.images) //FIXME ПЛОХО! element.images! 
          :
          `<div class="sortable-table__cell">${element[head.id]}</div>`
      }).join('')}
            </a>
            `
    }
  }

  // Template
  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
      <img data-element="loader" src="./loader.svg">
        ${this.getTableHeader(this.header)}
        <div data-element="body" class="sortable-table__body">
          ${this.getTableBody(this.data, this.header)}
        </div>
      </div>
    </div>
    `
  }

  async render() {
    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = this.getTemplate();
    this.element = tempWrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    await this.update();

    this.initEventListeners();
  }

  // Event Listeners
  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', (event) => this.onClickDataSort(event));
    document.addEventListener('scroll', this.onScrollDownLoadData);
  }

  onClickDataSort(event) {
    const headerCell = event.target.closest('[data-sortable="true"]');

    if (headerCell) {
      changeOrder(headerCell); // Меняем порядок сортировки

      this.changeSearchParams( // Меняем параметр сорировки в строке запроса
        { _sort: headerCell.dataset.id }
      );

      if (this.isSortLocally) {
        this.sortLocaly(headerCell.dataset.id, headerCell.dataset.order);
      } else {
        this.sortOnServer(headerCell.dataset.id, headerCell.dataset.order);
      }
    }

    function changeOrder(headerCell) {
      headerCell.dataset.order = (
        headerCell.dataset.order === 'asc' ? 'desc'
          :
          (headerCell.dataset.order === 'desc' ? 'asc' : '')
      );
    }
  }

  onScrollDownLoadData = () => {
    if (document.documentElement.scrollHeight < 3 / 2 * window.pageYOffset + document.documentElement.clientHeight && this.isLoading) {
      this.changeLoadingState();

      this.changeSearchParams({
        _start: this.searchParams._end,
        _end: this.searchParams._end + 30
      });

      this.update();
    }
  }

  sortLocaly(sortField, direction) {
    const sortedData = this.sortDataByParam(this.data, sortField, direction); // sort data

    const updatedTableBody = this.getTableBody(sortedData);
    this.sortableTableBody = this.subElements['body'];
    this.sortableTableBody.innerHTML = updatedTableBody;
  }

  sortOnServer(sortField, direction) {
    this.changeSearchParams({
      _sort: sortField,
      _order: direction,
      _start: 0, //FIXME Тут оставить захардкоженные значения?
      _end: 30
    })
    this.changeLoadingState();
    this.update();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    document.removeEventListener('scroll', this.onScrollDownLoadData);
  }

  // -------------- Utils Method Below --------------

  // Sorting
  sortDataByParam(arrOfObjects, sortField, sortDirection) {
    const array = arrOfObjects;
    return array.sort((a, b) => this.compareObjects(a, b, sortField, sortDirection));
  }

  compareObjects(a, b, sortField, sortDirection) {
    let compareResult = 0;
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    const direction = sortDirection === 'asc' ? 1 : sortDirection === 'desc' ? -1 : '' //* Вычисляем коэффициент направления сортировки

    if (typeof fieldA === 'string') {
      compareResult = compareString(fieldA, fieldB, ['ru', 'en'], direction);
    }
    if (typeof fieldB === 'number') {
      compareResult = compareNumber(fieldA, fieldB, direction);
    }

    return compareResult;

    // local function
    function compareNumber(a, b, direction) {
      let result = 0;

      result = a > b ? direction * 1 : direction * -1;
      return result;
    }

    function compareString(a, b, locales, direction) {
      return direction * a.localeCompare(b, [...locales], { sensitivity: 'variant', caseFirst: 'upper' });
    }
  }

  // Get all data-elements from DOM element
  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }
}