class DesignTool {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.propertiesPanel = document.getElementById('propertiesPanel');
        this.previewBtn = document.getElementById('previewBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.modal = document.getElementById('codeModal');
        this.closeModal = document.getElementById('closeModal');
        this.htmlCode = document.getElementById('htmlCode');
        this.cssCode = document.getElementById('cssCode');
        this.copyCode = document.getElementById('copyCode');
        
        this.elements = [];
        this.selectedElement = null;
        this.elementCounter = 0;
        
        this.init();
    }
    
    init() {
        this.setupDragAndDrop();
        this.setupEventListeners();
        this.setupCanvas();
    }
    
    setupDragAndDrop() {
        // Make element items draggable
        document.querySelectorAll('.element-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.element);
                e.target.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });
        
        // Canvas drop zone
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.canvas.classList.add('drag-over');
        });
        
        this.canvas.addEventListener('dragleave', (e) => {
            this.canvas.classList.remove('drag-over');
        });
        
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            this.canvas.classList.remove('drag-over');
            
            const elementType = e.dataTransfer.getData('text/plain');
            this.addElementToCanvas(elementType, e.offsetX, e.offsetY);
        });
    }
    
    setupEventListeners() {
        this.previewBtn.addEventListener('click', () => this.showCodePreview());
        this.exportBtn.addEventListener('click', () => this.exportCode());
        this.closeModal.addEventListener('click', () => this.hideCodePreview());
        this.copyCode.addEventListener('click', () => this.copyToClipboard());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideCodePreview();
            }
        });
    }
    
    setupCanvas() {
        // Remove placeholder when first element is added
        this.canvas.addEventListener('drop', () => {
            const placeholder = this.canvas.querySelector('.canvas-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
        });
    }
    
    addElementToCanvas(elementType, x, y) {
        this.elementCounter++;
        const elementId = `element-${this.elementCounter}`;
        
        const element = {
            id: elementId,
            type: elementType,
            x: x,
            y: y,
            attributes: this.getDefaultAttributes(elementType),
            content: this.getDefaultContent(elementType),
            styles: this.getDefaultStyles(elementType)
        };
        
        this.elements.push(element);
        this.renderElement(element);
        this.selectElement(element);
    }
    
    getDefaultAttributes(elementType) {
        const defaults = {
            img: { src: '', alt: 'Image', width: '200', height: '150' },
            a: { href: '#', target: '_blank' },
            input: { type: 'text', placeholder: 'Enter text...' },
            button: { type: 'button' },
            video: { src: '', controls: true, width: '320', height: '240' },
            audio: { src: '', controls: true },
            textarea: { rows: '3', cols: '30', placeholder: 'Enter text...' },
            select: { name: 'select' }
        };
        
        return defaults[elementType] || {};
    }
    
    getDefaultContent(elementType) {
        const defaults = {
            h1: 'Heading 1',
            h2: 'Heading 2',
            h3: 'Heading 3',
            p: 'This is a paragraph',
            button: 'Click me',
            a: 'Link text',
            li: 'List item',
            label: 'Label text',
            span: 'Span text',
            div: 'Div content'
        };
        
        return defaults[elementType] || '';
    }
    
    getDefaultStyles(elementType) {
        const defaults = {
            h1: { 'font-size': '2rem', 'font-weight': 'bold', 'margin': '0.5rem 0' },
            h2: { 'font-size': '1.5rem', 'font-weight': 'bold', 'margin': '0.5rem 0' },
            h3: { 'font-size': '1.2rem', 'font-weight': 'bold', 'margin': '0.5rem 0' },
            p: { 'margin': '0.5rem 0', 'line-height': '1.5' },
            button: { 'padding': '0.5rem 1rem', 'background': '#3498db', 'color': 'white', 'border': 'none', 'border-radius': '4px', 'cursor': 'pointer' },
            img: { 'max-width': '100%', 'height': 'auto', 'display': 'block' },
            input: { 'padding': '0.5rem', 'border': '1px solid #ccc', 'border-radius': '4px', 'width': '200px' },
            textarea: { 'padding': '0.5rem', 'border': '1px solid #ccc', 'border-radius': '4px', 'width': '100%', 'resize': 'vertical' }
        };
        
        return defaults[elementType] || {};
    }
    
    renderElement(element) {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'design-element';
        elementDiv.dataset.elementId = element.id;
        elementDiv.style.position = 'absolute';
        elementDiv.style.left = element.x + 'px';
        elementDiv.style.top = element.y + 'px';
        elementDiv.style.cursor = 'move';
        
        // Create the actual HTML element
        const htmlElement = this.createElement(element);
        elementDiv.appendChild(htmlElement);
        
        // Add event listeners
        elementDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });
        
        this.canvas.appendChild(elementDiv);
    }
    
    createElement(element) {
        const el = document.createElement(element.type);
        
        // Set attributes
        Object.entries(element.attributes).forEach(([key, value]) => {
            if (value !== '') {
                el.setAttribute(key, value);
            }
        });
        
        // Set content
        if (element.content && !['img', 'input', 'textarea'].includes(element.type)) {
            el.textContent = element.content;
        }
        
        // Set styles
        Object.entries(element.styles).forEach(([key, value]) => {
            el.style[key] = value;
        });
        
        return el;
    }
    
    selectElement(element) {
        // Remove previous selection
        document.querySelectorAll('.design-element').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select new element
        const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
        if (elementDiv) {
            elementDiv.classList.add('selected');
        }
        
        this.selectedElement = element;
        this.showProperties(element);
    }
    
    showProperties(element) {
        const propertiesHtml = this.generatePropertiesHTML(element);
        this.propertiesPanel.innerHTML = propertiesHtml;
        
        // Add event listeners to property inputs
        this.setupPropertyListeners(element);
    }
    
    generatePropertiesHTML(element) {
        let html = `<h4>${element.type.toUpperCase()} Properties</h4>`;
        
        // Content property
        if (element.content !== undefined) {
            html += `
                <div class="property-group">
                    <label>Content:</label>
                    <input type="text" id="content" value="${element.content}" />
                </div>
            `;
        }
        
        // Attributes
        Object.entries(element.attributes).forEach(([key, value]) => {
            html += `
                <div class="property-group">
                    <label>${key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                    <input type="text" id="${key}" value="${value}" />
                </div>
            `;
        });
        
        // Common styles
        const commonStyles = ['color', 'background-color', 'font-size', 'padding', 'margin', 'width', 'height'];
        commonStyles.forEach(style => {
            const value = element.styles[style] || '';
            html += `
                <div class="property-group">
                    <label>${style.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</label>
                    <input type="text" id="style-${style}" value="${value}" />
                </div>
            `;
        });
        
        return html;
    }
    
    setupPropertyListeners(element) {
        // Content listener
        const contentInput = document.getElementById('content');
        if (contentInput) {
            contentInput.addEventListener('input', (e) => {
                element.content = e.target.value;
                this.updateElement(element);
            });
        }
        
        // Attribute listeners
        Object.keys(element.attributes).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.addEventListener('input', (e) => {
                    element.attributes[key] = e.target.value;
                    this.updateElement(element);
                });
            }
        });
        
        // Style listeners
        Object.keys(element.styles).forEach(style => {
            const input = document.getElementById(`style-${style}`);
            if (input) {
                input.addEventListener('input', (e) => {
                    element.styles[style] = e.target.value;
                    this.updateElement(element);
                });
            }
        });
    }
    
    updateElement(element) {
        const elementDiv = document.querySelector(`[data-element-id="${element.id}"]`);
        if (elementDiv) {
            elementDiv.innerHTML = '';
            const htmlElement = this.createElement(element);
            elementDiv.appendChild(htmlElement);
        }
    }
    
    showCodePreview() {
        const html = this.generateHTML();
        const css = this.generateCSS();
        
        this.htmlCode.textContent = html;
        this.cssCode.textContent = css;
        
        this.modal.style.display = 'block';
    }
    
    hideCodePreview() {
        this.modal.style.display = 'none';
    }
    
    generateHTML() {
        let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Generated Page</title>\n    <style>\n';
        html += this.generateCSS();
        html += '    </style>\n</head>\n<body>\n';
        
        this.elements.forEach(element => {
            html += this.generateElementHTML(element);
        });
        
        html += '</body>\n</html>';
        return html;
    }
    
    generateCSS() {
        let css = 'body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n\n';
        
        this.elements.forEach((element, index) => {
            css += `.element-${index + 1} {\n`;
            Object.entries(element.styles).forEach(([key, value]) => {
                if (value) {
                    css += `    ${key}: ${value};\n`;
                }
            });
            css += '}\n\n';
        });
        
        return css;
    }
    
    generateElementHTML(element) {
        let html = `    <${element.type}`;
        
        // Add attributes
        Object.entries(element.attributes).forEach(([key, value]) => {
            if (value !== '') {
                html += ` ${key}="${value}"`;
            }
        });
        
        html += '>';
        
        // Add content
        if (element.content && !['img', 'input', 'textarea'].includes(element.type)) {
            html += element.content;
        }
        
        html += `</${element.type}>\n`;
        return html;
    }
    
    exportCode() {
        const html = this.generateHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-page.html';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    copyToClipboard() {
        const activeTab = document.querySelector('.tab-btn.active');
        const code = activeTab.dataset.tab === 'html' ? this.htmlCode.textContent : this.cssCode.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            alert('Code copied to clipboard!');
        });
    }
}

// Initialize the design tool when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DesignTool();
});

// Tab switching functionality
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const tab = e.target.dataset.tab;
        document.querySelectorAll('.code-block').forEach(block => block.style.display = 'none');
        document.getElementById(tab + 'Code').style.display = 'block';
    }
});
