class JsonTreeViewer {
    static CSS = `* { font-family: monospace; }
ul { list-style-type: none; padding-left: 1em; }
li { margin: 3px 0; }
.key { font-weight: bold; }
.collapsible { cursor: pointer; user-select: none; }
.collapsed > ul { display: none; }
.closed::after { content: '…'; }
.opened::after { content: ''; }`
    static injectCSS() {
        if (document.getElementById('json-tree-style')) return; // only inject once

        const style = document.createElement('style');
        style.id = 'json-tree-style';
        style.textContent = JsonTreeViewer.CSS;
        document.head.appendChild(style);
    }

    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.openPaths = new Set();
        this._isRendering = false;
        this.initClickHandler();
        JsonTreeViewer.injectCSS();
        this.render();
    }

    pathToString(path) {
        return path.join('.');
    }

    getDataByPath(data, pathArray) {
        let current = data;
        for (const key of pathArray) {
            current = current?.[key];
            if (current === undefined) break;
        }
        return current;
    }
    
    recursivelyOpenPath(path = [], obj) {
        const recurse = (currentObj, currentPath) => {
            if (typeof currentObj === 'object' && currentObj !== null) {
                const pathStr = this.pathToString(currentPath);
                this.openPaths.add(pathStr);
    
                for (const key in currentObj) {
                    recurse(currentObj[key], [...currentPath, key]);
                }
            }
        };
        recurse(obj, path);
    }

    recursivelyClosePath(path = [], obj) {
        const recurse = (currentObj, currentPath) => {
            if (typeof currentObj === 'object' && currentObj !== null) {
                const pathStr = this.pathToString(currentPath);
                this.openPaths.delete(pathStr);
    
                for (const key in currentObj) {
                    recurse(currentObj[key], [...currentPath, key]);
                }
            }
        };
        recurse(obj, path);
    }

    formatValue(value) {
        if (value === undefined) return '<i>undefined</i>';
        if (value === null) return '<i>null</i>';
        if (typeof value === 'string') return `"${value}"`;
        return value;
    }

    createTree(data, path = []) {
        const ul = document.createElement('ul');
        const isObject = (val) => typeof val === 'object' && val !== null;

        const addNode = (key, value) => {
            const fullPath = [...path, key];
            const pathStr = this.pathToString(fullPath);
            const li = document.createElement('li');

            if (isObject(value)) {
                const isEmpty = Object.keys(value).length === 0;
                if (isEmpty) {
                    let isArray = Array.isArray(value);
                    li.innerHTML = `<span class="key">${key}</span>: <i>empty (${isArray ? "Array" : "Object"})</i>`;
                } else {
                    li.classList.add('collapsed');
                    if (this.openPaths.has(pathStr)) li.classList.remove('collapsed');

                    const isOpen = this.openPaths.has(pathStr);
                    li.classList.toggle('collapsed', !isOpen);

                    li.innerHTML = `<span class="collapsible key" data-path="${pathStr}">
                                    ${key}: <span class="affix${isOpen ? ' opened' : ' closed'}"></span>
                    </span>`;
                    li.appendChild(this.createTree(value, fullPath));
                }
            } else {
                li.innerHTML = `<span class="key">${key}</span>: ${this.formatValue(value)}`;
            }

            ul.appendChild(li);
        };

        if (Array.isArray(data)) {
            data.forEach((item, index) => addNode(index, item));
        } else {
            for (const key in data) {
                addNode(key, data[key]);
            }
        }

        return ul;
    }

    async render() {
        if (this._isRendering) return;
        this._isRendering = true;
    
        this.container.innerHTML = '';
        this.container.appendChild(this.createTree(this.data));
    
        this._isRendering = false;
    }

    setData(newData) {
        this.data = newData;
        this.render();
    }

    initClickHandler() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('collapsible')) {
                const parentLi = e.target.parentElement;
                const path = e.target.getAttribute('data-path');

                // Toggle open path
                if (this.openPaths.has(path)) {
                    this.openPaths.delete(path);
                } else {
                    this.openPaths.add(path);
                }

                // Toggle visual class
                parentLi.classList.toggle('collapsed');

                const affix = e.target.querySelector('.affix');
                if (affix) {
                    if (affix.classList.contains('opened')) {
                        affix.classList.remove('opened');
                        affix.classList.add('closed');
                    } else {
                        affix.classList.remove('closed');
                        affix.classList.add('opened');
                    }
                }
            }
        });

        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('collapsible')) {
                e.preventDefault();
                const path = e.target.getAttribute('data-path');
                const pathArray = path.split('.');
                const targetData = this.getDataByPath(this.data, pathArray);
        
                if (this.openPaths.has(path)) {
                    this.recursivelyClosePath(pathArray, targetData);
                } else {
                    this.recursivelyOpenPath(pathArray, targetData);
                }
        
                this.render();
            }
        });
    }

    uncollapseAll() {
        const openAllPaths = (obj, path = []) => {
            if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    const newPath = [...path, key];
                    this.openPaths.add(this.pathToString(newPath));
                    openAllPaths(obj[key], newPath);
                }
            }
        };
        openAllPaths(this.data);
        this.render();
    }

    collapseAll() {
        this.openPaths.clear();
        this.render();
    }
}