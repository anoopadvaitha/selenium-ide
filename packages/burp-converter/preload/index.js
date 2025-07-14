// @ts-expect-error - this is an exposed global
const api = window.sideAPI;
api.plugins.addRecorderPreprocessor((command, event) => {
    api.channels.send('record-event', command);
    const return_element = {
        isShadowElement: false,
        tagName: '',
        placeholder: '',
        className: '',
        name: '',
        id: '',
        textContent: '',
        innerHTML: '',
        value: '',
        elementType: '',
        textNodes: [],
        tagNodeIndex: 0,
        xPath: '',
        characterPos: 0,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
        metaKey: false,
    };
    if (event != undefined &&
        event instanceof Event &&
        'target' in event &&
        event.target &&
        event.target instanceof HTMLElement) {
        let element = null;
        element = event.target;
        return_element.isShadowElement = !!element.shadowRoot;
        return_element.tagName = element.tagName;
        return_element.placeholder = element.getAttribute('placeholder') || '';
        return_element.className = element.className || '';
        return_element.name = element.getAttribute('name') || '';
        return_element.id = element.id || '';
        return_element.textContent = element.textContent || '';
        return_element.innerHTML = element.innerHTML || '';
        if (element instanceof HTMLInputElement) {
            return_element.value = element.value || '';
            return_element.elementType = element.type || '';
        }
        return_element.textNodes = Array.from(element.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent || '');
        return_element.tagNodeIndex = Array.from(element.parentNode?.children || []).indexOf(element);
        return_element.xPath = '';
        const getXPath = (element) => {
            const parts = [];
            while (element && element.nodeType === Node.ELEMENT_NODE) {
            let index = 0;
            let sibling = element.previousSibling;
            while (sibling) {
                if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
                index++;
                }
                sibling = sibling.previousSibling;
            }
            const tagName = element.nodeName.toLowerCase();
            const pathIndex = index ? `[${index + 1}]` : '';
            parts.unshift(`${tagName}${pathIndex}`);
            element = element.parentNode;
            }
            return parts.length ? `/${parts.join('/')}` : '';
        };
        return_element.xPath = getXPath(element);
        return_element.characterPos = 0;
        if (event instanceof MouseEvent || event instanceof KeyboardEvent) {
            return_element.metaKey = event.metaKey || false;
            return_element.ctrlKey = event.ctrlKey || false;
            return_element.shiftKey = event.shiftKey || false;
            return_element.altKey = event.altKey || false;
        }
    }
    return {
        action: 'update',
        command: {
            ...command,
            comment: 'Changes made by Burp Recorder plugin',
            extra_params: JSON.stringify(return_element),
        },
    };
});
//# sourceMappingURL=index.js.map