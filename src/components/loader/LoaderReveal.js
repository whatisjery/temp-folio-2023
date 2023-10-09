import gsap from 'gsap';

export default class LoaderReveal {
    constructor(loader, transition, destroy) {
        this.loader = loader;
        this.transition = transition;
        this.destroy = destroy;

        this.loaderTextSplit = [...document.querySelectorAll('.loader .text-split')];
        this.introTextSplit = [...document.querySelectorAll('.intro .text-split')];

        this.timeline = null;
    }

    kill = () => {
        if (this.timeline) this.timeline.kill();
    };

    setupTimeline() {
        this.timeline = gsap.timeline({
            defaults: {
                ease: 'expo.inOut'
            }
        });

        this.timeline.set([this.loaderTextSplit.map(({ children }) => children), '.r-rolling'], {
            opacity: 0
        });
    }

    startSequence = () => {
        let durationTracker = null;

        this.timeline
            .to(
                '.r-slider',
                {
                    opacity: 0,
                    yPercent: 100,
                    duration: 2.3
                },
                `-=2.3`
            )
            .fromTo(
                '.r-rolling',
                {
                    yPercent: 0
                },
                {
                    yPercent: -100,
                    opacity: 1,
                    duration: 2.6
                },
                `-=2.3`
            )
            .to(
                '.r-header-item',
                {
                    yPercent: -100,
                    opacity: 0,
                    duration: 2.3
                },
                `-=2.3`
            );

        durationTracker = this.timeline.duration();

        this.loaderTextSplit.forEach(({ children }) => {
            this.timeline.fromTo(
                children,
                {
                    yPercent: 100
                },
                {
                    yPercent: 0,
                    opacity: 1,
                    ease: 'expo.out',
                    duration: 1.5,
                    onStart: () => {
                        gsap.set(this.loader, { cursor: 'unset' });
                    },
                    stagger: {
                        amount: 0.21,
                        from: 'start'
                    }
                },
                durationTracker - 1.2
            );
        });

        this.timeline
            .to(this.transition, {
                delay: -0.8,
                progress: 0,
                ease: 'expo.inOut',
                duration: 2.2,

                onUpdate: () => {
                    this.transition.update();

                    gsap.to('.grid-overlay', {
                        zIndex: 100
                    });
                }
            })
            .to(
                '.r-center',
                {
                    yPercent: -70,
                    opacity: 0,
                    duration: 2.3
                },
                `-=2.3`
            )
            .fromTo(
                '.r-header-part',
                {
                    yPercent: 100,
                    opacity: 1
                },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 2
                },
                `-=1.6`
            )
            .fromTo(
                '.r-about',
                {
                    yPercent: 21,
                    opacity: 0
                },
                {
                    yPercent: 0,
                    ease: 'expo.inOut',
                    duration: 2.7,
                    opacity: 1
                },
                `-=2.8`
            )
            .fromTo(
                '.r-intro',
                {
                    yPercent: 30
                },
                {
                    yPercent: 0,
                    ease: 'expo.inOut',
                    duration: 2.8,
                    opacity: 1
                },
                `-=2.8`
            );

        durationTracker = this.timeline.duration();

        this.introTextSplit.forEach(el => {
            this.timeline.fromTo(
                el.children,
                {
                    yPercent: 80
                },
                {
                    yPercent: 0,
                    opacity: 1,
                    ease: 'expo.out',
                    duration: 1.8,

                    stagger: {
                        amount: 0.43
                    },
                    onComplete: () => {
                        this.destroy();
                    }
                },
                durationTracker - 1.77
            );
        });

        this.timeline.fromTo(
            ['.r-intro-tag', '.r-webgl'],
            {
                opacity: 0
            },
            {
                opacity: 1,
                duration: 0.8,
                ease: 'none'
            },
            `-=1.8`
        );
    };
}
