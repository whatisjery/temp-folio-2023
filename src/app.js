import { inject as analytics } from '@vercel/analytics';
import './styles/_base.css';

import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';
import ScrollTrigger from 'gsap/ScrollTrigger';

import Navigation from './navigation';
import MainPage from './pages';
import LostPage from './pages/Lost';

class App {
    constructor() {
        this.pages = new Map();
        this.navigation = new Navigation();

        this.pages.set('home', new MainPage());
        this.pages.set('lost', new LostPage());

        this.init();
    }

    init = () => {
        analytics();

        this.services();

        this.navigation.init(this.pages);
    };

    services = () => {
        gsap.registerPlugin(ScrollTrigger);
        gsap.registerPlugin(CustomEase);
        gsap.registerEase('customEase', 'M0,0 C0.7,0.1 -0.03,1 1,1');
        gsap.config({ force3D: true });
        gsap.ticker.fps(120);
    };
}

new App();
