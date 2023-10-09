import gsap from 'gsap';

export default class Ticker {
    constructor(speedInMs) {
        this.speedInMs = speedInMs;
        this.lastTime = Date.now();
    }

    addTicker = () => {
        if (this.speedInMs) {
            this.tickerFunction = () => {
                let currentTime = Date.now();
                let deltaTime = currentTime - this.lastTime;

                if (deltaTime >= this.speedInMs) {
                    this.updateTicker();
                    this.lastTime = currentTime;
                }
            };
        } else {
            this.tickerFunction = this.updateTicker;
        }

        gsap.ticker.add(this.tickerFunction);
    };

    removeTicker = () => {
        gsap.ticker.remove(this.tickerFunction);
    };
}
