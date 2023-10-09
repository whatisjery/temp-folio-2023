import gsap from 'gsap';

export default class Line {
    constructor() {
        this.lines = [...document.querySelectorAll('.line')];
    }

    mount = () => {
        this.draw();
    };

    destroy = () => {};

    draw = () => {
        this.lines.forEach(line => {
            gsap.to(line.children, {
                width: '100%',
                duration: 2,
                ease: 'expo.out',

                scrollTrigger: {
                    trigger: line,
                    start: 'top bottom',
                    toggleActions: 'restart none none restart'
                }
            });
        });
    };
}
