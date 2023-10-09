import gsap from 'gsap';

// Normalize speed across different screen FPS (frames per second)
export const getDeltaTime = ease => {
    return 1.0 - Math.pow(1.0 - ease, gsap.ticker.deltaRatio());
};

export const lerp = (start, end, ease) => {
    return start + ease * (end - start);
};

export const clamp = (num, min, max) => {
    return gsap.utils.clamp(min, max, num);
};

export const mapRange = (inMin, inMax, outMin, outMax, val) => {
    return gsap.utils.mapRange(inMin, inMax, outMin, outMax, val);
};

export const progress = (val, min, max) => {
    return val / (max - min) + min;
};

export const inView = el => {
    const bounds = el.getBoundingClientRect();

    return bounds.top < window.innerHeight && bounds.bottom >= 0;
};

export const getCSSvar = variable => {
    const rootStyles = getComputedStyle(document.documentElement);

    return rootStyles.getPropertyValue(variable).trim();
};

export const listen = (target, type, listener, options = {}) => {
    const events = Array.isArray(type) ? type : [type];

    const isPassiveEvent = event => {
        return event.startsWith('touch') || ['resize', 'scroll', 'wheel'].includes(event);
    };

    events.forEach(event => {
        let opts = options;

        if (isPassiveEvent(event)) opts = { ...options, passive: true };

        target.addEventListener(event, listener, opts);
    });

    return {
        remove: () => {
            if (!events || !target) return;

            events.forEach(event => target.removeEventListener(event, listener, options));
        }
    };
};

export const isDevice = () => {
    const ua = navigator.userAgent.toLowerCase();

    const isWindowsPhone = /windows phone|iemobile|wpdesktop/.test(ua);

    const isDroidPhone = !isWindowsPhone && /android.*mobile/.test(ua);
    const isDroidTablet = !isWindowsPhone && !isDroidPhone && /android/i.test(ua);

    const isIos = !isWindowsPhone && /ip(hone|od|ad)/i.test(ua) && !window.MSStream;
    const isIpad = !isWindowsPhone && /ipad/i.test(ua) && isIos;

    const isTablet = isDroidTablet || isIpad;
    const isPhone = isDroidPhone || (isIos && !isIpad) || isWindowsPhone;

    return isPhone || isTablet;
};
