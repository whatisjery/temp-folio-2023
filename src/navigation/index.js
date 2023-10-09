import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default class Navigation {
    constructor() {
        this.vercel404 = document.querySelector('.vercel-404');
        this.paths = { '/': 'home' };
        this.activePage = null;
    }

    init(pages) {
        this.pages = pages;

        this.navigate(window.location.pathname || '/');
    }

    destroy = () => {
        ScrollTrigger.killAll();
        gsap.globalTimeline.clear();
    };

    navigate(path) {
        if (this.vercel404) {
            this.getPage('lost');
            return;
        }

        const pageKey = this.paths[path];

        if (!pageKey) return;

        this.getPage(pageKey);

        window.history.replaceState({}, '', path);
    }

    getPage = page => {
        if (this.activePage) {
            this.activePage.destroy();
        }

        this.activePage = this.pages.get(page);

        this.activePage.mount();
    };
}
