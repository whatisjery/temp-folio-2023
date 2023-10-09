// ./food.js
export default class Grid {
    constructor(sizeX, sizeY, size) {
        this.size = size;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.footer = document.querySelector('.footer');
    }

    get getGrid() {
        return document.querySelector('.snake__grid');
    }

    setGridStyles = () => {
        this.getGrid.style.gridTemplateColumns = `repeat(${this.sizeX}, ${this.size}px)`;
        this.getGrid.style.gridTemplateRows = `repeat(${this.sizeY}, ${this.size}px)`;
    };

    draw = () => {
        this.footer.insertAdjacentHTML(
            'afterbegin',
            `
            <div class="snake">
                <div class="snake__grid"></div>
            </div>
                `
        );
    };
}
