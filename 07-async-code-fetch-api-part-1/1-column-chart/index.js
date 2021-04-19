import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class ColumnChart {

    constructor({
        label = '',
        link = '',
        formatHeading = data => data,
        url = '',
        range = {
            from: new Date(),
            to: new Date(),
        }
    } = {}) {
        this.url = url;
        this.range = range;
        this.label = label;
        this.link = link;
        this.formatHeading = formatHeading;
        this.chartHeight = 50;

        this.render();
        this.loadData();
    }

    urlCreate() {
        const url = new URL(this.url, BACKEND_URL);
        for (let key in this.range) {
            url.searchParams.set(key, this.range[key].toISOString());
        }

        return url;
    }

    async loadData() {
        const response = await fetchJson(this.urlCreate());
        const loadedData = Object.values(response);
        this.updateColumnChart(loadedData);
    }

    async update(start, end) {
        this.range = {
            from: start,
            to: end
        }
        await this.loadData();
    }

    updateColumnChart = (newData) => {
        this.data = newData;
        this.calculateTotalValue();

        const columnChart = this.subElements['columnChart'];
        if (columnChart.classList.contains('column-chart_loading')) {
            columnChart.classList.remove('column-chart_loading');
        }

        const columnChartChart = this.subElements['body'];
        columnChartChart.innerHTML = this.createColumnChartBody();

        const columnChartHeader = this.subElements['header'];
        columnChartHeader.textContent = this.value;
    }

    calculateTotalValue() {
        this.value = this.formatHeading(Object.values(this.data).reduce((accum, item) => (accum + item), 0))
    }

    createColumnChartBody = () => {

        if (!this.data || this.data.length === 0) return `<img src="./charts-skeleton.svg">`

        const maxDataValue = Math.max(...this.data);

        return this.data.reduce((prev, cur) => { //TODO Вынести вычисления в отдельный метод?
            return prev +
                `<div
                    style="--value: ${Math.floor(cur * 50 / maxDataValue)}" 
                    data-tooltip="${(cur / maxDataValue * 100).toFixed(0)}%"
                ></div>`
        }, ``)
    }

    getTemplate() {
        return `
                <div class="column-chart ${!this.data || this.data.length === 0 ? 'column-chart_loading' : ''}"
                    data-element="columnChart"
                   "style="--chart-height: ${this.chartHeight}"
                >
                    <div class="column-chart__title">
                        Total ${this.label}
                        ${this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : ``}
                    </div>
                    <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">${this.value ? this.value : 'USD 100'}</div>
                    <div data-element="body" class="column-chart__chart">
                        ${this.createColumnChartBody()}
                    </div>
                </div>
                </div>
                `
    }

    render() {
        const element = document.createElement('div');
        element.innerHTML = this.getTemplate();
        this.element = element.firstElementChild;

        this.getSubElements(element);
        console.dir(this.subElements);
    }


    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }

    // Utils Method
    getSubElements(element) {
        const result = {};

        const elements = element.querySelectorAll('[data-element]');
        for (let element of elements) {
            const name = element.dataset.element;

            result[name] = element;
        }

        this.subElements = result;
    }
}

