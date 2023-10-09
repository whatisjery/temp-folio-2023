export default class TextSplit {
    constructor() {
        this.textSplit = [...document.querySelectorAll('.text-split')];
    }

    mount = () => {
        this.insert();
    };

    split = content => {
        const textContent = content.textContent.trim();

        content.textContent = '';

        return [...textContent];
    };

    insert = () => {
        if (!this.textSplit || !this.textSplit.length) return;

        this.textSplit.forEach(content => this.markup(content, this.split(content)));
    };

    markup = (content, chars) => {
        if (chars.length <= 0) return;

        let htmlToInsert = '';

        for (let i = 0; i < chars.length; i++) {
            let char = chars[i];
            htmlToInsert += `<span class="text-split__content"><span class="text-split__letter">${char}</span></span>`;
        }

        content.insertAdjacentHTML('afterbegin', htmlToInsert.trim());
    };
}
