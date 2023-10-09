import { store } from '../../store';

// ./food.js
export default class Food {
    constructor(sizeX, sizeY, segment) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.segment = segment;
        this.location = this.spawn();
    }

    get getGrid() {
        return document.querySelector('.snake__grid');
    }

    get getFood() {
        return document.querySelector('.snake__food');
    }

    randNumber = size => {
        return Math.floor(Math.random() * size) + 1;
    };

    spawn = () => {
        let newLocation;

        while (newLocation == null || this.collision(newLocation)) {
            newLocation = {
                x: Math.abs(this.randNumber(this.sizeX - 10)),
                y: Math.abs(this.randNumber(this.sizeY - 10))
            };
        }
        return newLocation;
    };

    collision = newLocation => {
        if (!this.segment) return;

        return this.segment.segments.some(
            el => el.x === newLocation.x && el.y === newLocation.y
        );
    };

    attachToCursor = () => {
        const bounds = this.getFood.getBoundingClientRect();

        if (!bounds) return;

        store.cursor.bounds = {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
        };
    };

    draw = () => {
        const foodElement = this.getGrid.querySelector('.snake__food');

        if (foodElement) foodElement.remove();

        this.getGrid.insertAdjacentHTML(
            'afterbegin',
            `
            <div 
                class="snake__food"
                style="grid-row-start: ${this.location.y}; grid-column-start: ${this.location.x}"
            </div>
            `
        );
    };
}
