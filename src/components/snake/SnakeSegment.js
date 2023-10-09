// ./food.js
export default class Segment {
    constructor(sizeX, sizeY, grid) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.grid = grid;

        this.segments = [
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 2 }
        ];
    }

    grow = foodLocation => {
        this.segments = [foodLocation, ...this.segments];
    };

    collision = unmountCallback => {
        const head = {
            ...this.segments[0]
        };

        const tail = this.segments.slice(1, -1);

        const touches = tail.some(el => {
            return el.x === head.x && el.y === head.y;
        });

        if (touches) unmountCallback();
    };

    draw = () => {
        const snakeItems = this.grid.getGrid.querySelectorAll('.snake__segment');

        if (snakeItems.length) snakeItems.forEach(el => el.remove());

        this.segments.forEach(segment => {
            this.grid.getGrid.insertAdjacentHTML(
                'afterbegin',
                `
                <div 
                    class="snake__segment"
                    style="grid-row-start: ${segment.y}; grid-column-start: ${segment.x}"
                </div>
            `
            );
        });
    };
}
