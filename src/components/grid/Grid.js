import { SIZES } from '../../constant';

export default class Grid {
    constructor() {
        this.layout = document.querySelector('#layout');
        this.grid = [...Array(SIZES.grid).keys()];
    }

    mount = () => {
        this.insertHtml();
    };

    destroy = () => {
        const grid = document.querySelector('.grid');

        if (grid) grid.remove();
    };

    insertHtml = () => {
        this.layout.insertAdjacentHTML(
            'afterbegin',
            `
            <div class="grid grid-overlay r-grid">
                <div class="grid__overlay grid-overlay">
                    ${this.grid.map(id => `<div id="${id}" class="grid__column"></div>`).join('')}
                </div>
                <div class="grid__model-anchor"></div>
            </div>
        `
        );
    };
}
