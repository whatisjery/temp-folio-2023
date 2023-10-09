// ./food.js
export default class Score {
    constructor() {
        this.container = document.querySelector('.snake__score');
        this.winsElement = document.querySelector('.snake__score-wins');

        this.wins = 0;
    }

    init = () => {
        this.wins = 0;
        this.winsElement.textContent = this.wins;
    };

    update = () => {
        this.wins += 1;
        this.winsElement.textContent = this.wins;
    };
}
