// AIWEBSITEBUILDER CLASS
class AIWebsiteBuilder {
    // CONSTRUCTOR
    constructor() {
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.currentFiles = {
            html: '',
            css: '',
            js: ''
        };
        this.activeFile = 'html';
        this.currentPrompt = '';
        this.isGenerating = false;
        this.isEnhancing = false;
        this.abortController = null;
        this.initializeElements();
        this.bindEvents();
        this.loadCurrentState();
        this.renderHistory();
    }

    // ELEMENT INITIALIZATION
    initializeElements() {
        this.promptInput = document.getElementById('promptInput');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.modelSelect = document.getElementById('modelSelect');
        this.generateBtn = document.getElementById('generateBtn');
        this.enhanceBtn = document.getElementById('enhanceBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.suggestionCards = document.querySelectorAll('.suggestion-card');
        this.loadingSection = document.getElementById('loadingSection');
        this.editorContainer = document.getElementById('editorPreviewContainer');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.regenerateBtn = document.getElementById('regenerateBtn');
        this.htmlEditor = document.getElementById('htmlEditor');
        this.cssEditor = document.getElementById('cssEditor');
        this.jsEditor = document.getElementById('jsEditor');
        this.deviceBtns = document.querySelectorAll('.device-btn');
        this.openNewTabBtn = document.getElementById('openNewTabBtn');
        this.previewFrame = document.getElementById('previewFrame');
        this.statusMessage = document.getElementById('statusMessage');
        this.historySection = document.getElementById('historySection');
        this.historyGrid = document.getElementById('historyGrid');
        this.btnClearHistory = document.querySelector('.btn-clear-history');
    }

    // EVENT BINDING
    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateWebsite());
        this.enhanceBtn.addEventListener('click', () => this.enhancePrompt());
        this.stopBtn.addEventListener('click', () => this.stopGeneration());
        this.regenerateBtn.addEventListener('click', () => this.generateWebsite());
        this.downloadBtn.addEventListener('click', () => this.downloadWebsite());
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchFile(btn.dataset.file));
        });
        this.deviceBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchDevice(btn.dataset.device));
        });
        this.htmlEditor.addEventListener('input', () => this.onCodeChange('html'));
        this.cssEditor.addEventListener('input', () => this.onCodeChange('css'));
        this.jsEditor.addEventListener('input', () => this.onCodeChange('js'));
        this.suggestionCards.forEach(card => {
            card.addEventListener('click', () => {
                this.promptInput.value = card.dataset.prompt;
                this.generateWebsite();
            });
        });
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateWebsite();
            }
        });
        if (this.openNewTabBtn) {
            this.openNewTabBtn.addEventListener('click', () => this.openPreviewInNewTab());
        }
        if (this.btnClearHistory) {
            this.btnClearHistory.addEventListener('click', () => this.clearHistory());
        }
        // this.apiKeyInput.addEventListener('input', () => {
        //     localStorage.setItem('openrouter_api_key', this.apiKeyInput.value);
        // });
        // const savedApiKey = localStorage.getItem('openrouter_api_key');
        // if (savedApiKey) {
        //     this.apiKeyInput.value = savedApiKey;
        // }
    }

    // VALIDATE OPENROUTER API KEY FORMAT
    validateApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showStatus('Please enter your OpenRouter API key to continue!', 'error');
            this.apiKeyInput.focus();
            return false;
        }
        if (!apiKey.startsWith('sk-or-v1-')) {
            this.showStatus('Please enter a valid OpenRouter API key start with "sk-or-v1-"', 'error');
            this.apiKeyInput.focus();
            return false;
        }
        return true;
    }

    // GET THE API KEY FROM INPUT FIELD
    getApiKey() {
        return this.apiKeyInput.value.trim();
    }

    // ENHANCE THE USER’S PROMPT USING AI
    async enhancePrompt() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) {
            this.showStatus('Please enter a prompt first!', 'error');
            return;
        }
        if (!this.validateApiKey()) {
            return;
        }
        if (this.isEnhancing || this.isGenerating) return;
        this.isEnhancing = true;
        this.enhanceBtn.disabled = true;
        this.enhanceBtn.textContent = 'Enhancing...';
        this.generateBtn.disabled = true;
        try {
            this.abortController = new AbortController();
            const enhancePrompt = `You are a prompt enhancement expert. Transform the user's basic request into a detailed, actionable prompt for website generation.

            Original prompt: "${prompt}"

            Enhanced prompt should include:
            - Specific Design Style and Color Scheme
            - Layout Structure
            - Interactive Elements
            - Responsive Design
            - Modern UI/UX Principles

            Return only the enhanced prompt, nothing else.`;
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getApiKey()}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'WebLlama'
                },
                body: JSON.stringify({
                    model: this.modelSelect.value,
                    messages: [{
                        role: 'user',
                        content: enhancePrompt
                    }],
                    temperature: 0.5,
                }),
                signal: this.abortController.signal
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const enhancedPrompt = data.choices[0].message.content.trim();
            this.promptInput.value = enhancedPrompt;
            this.showStatus('Prompt enhanced successfully!', 'success');
        } catch (error) {
            if (error.name === 'AbortError') {
                this.showStatus('Enhancement stopped', 'info');
            } else {
                console.error('Enhancement error:', error);
                if (error.message.includes('401') || error.message.includes('403')) {
                    this.showStatus('Invalid API key. Please check your OpenRouter API key.', 'error');
                } else {
                    this.showStatus('Failed to enhance prompt. Please try again.', 'error');
                }
            }
        } finally {
            this.isEnhancing = false;
            this.enhanceBtn.disabled = false;
            this.enhanceBtn.textContent = 'Enhance Prompt';
            this.generateBtn.disabled = false;
            this.abortController = null;
        }
    }

    // OPEN PREVIEW IN A NEW TAB
    openPreviewInNewTab() {
        const htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <title>WebLlama Site Preview</title>
            <style>
              ${this.currentFiles.css || ''}
            </style>
        </head>
        <body>
            ${this.currentFiles.html || ''}
            <script>
              ${this.currentFiles.js || ''}
            </script>
        </body>
        </html>`;
        const blob = new Blob([htmlContent], {
            type: 'text/html'
        });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }

    // GENERATE A WEBSITE FROM USER’S PROMPT
    async generateWebsite() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) {
            this.showStatus('Please enter a description for your website.', 'error');
            return;
        }
        if (!this.validateApiKey()) {
            return;
        }
        if (this.isGenerating || this.isEnhancing) {
            this.showStatus('Generation already in progress.', 'info');
            return;
        }
        this.currentPrompt = prompt;
        this.startGeneration();
        this.showLoadingMessages();
        try {
            const websiteCode = await this.callOpenRouterAPI(prompt);
            this.parseGeneratedCode(websiteCode);
            this.showEditor();
            this.updatePreview();
            this.saveToHistory(prompt, this.modelSelect.value, this.currentFiles);
            this.showStatus('Website generated successfully!', 'success');
        } catch (error) {
            if (error.name === 'AbortError') {
                this.showStatus('Generation stopped by user.', 'info');
            } else {
                console.error('Generation error:', error);
                if (error.message.includes('401') || error.message.includes('403')) {
                    this.showStatus('Invalid API key. Please check your OpenRouter API key.', 'error');
                } else {
                    this.showStatus(`Error generating website: ${error.message}`, 'error');
                }
            }
        } finally {
            this.stopGeneration();
        }
    }

    // START GENERATION
    startGeneration() {
        this.isGenerating = true;
        this.abortController = new AbortController();
        this.generateBtn.querySelector('.btn-text').style.display = 'none';
        this.generateBtn.querySelector('.loader').style.display = 'inline';
        this.generateBtn.disabled = true;
        this.enhanceBtn.disabled = true;
        this.stopBtn.style.display = 'block';
        this.loadingSection.style.display = 'block';
        this.loadingSection.scrollIntoView({
            behavior: 'smooth'
        });
    }

    // STOP GENERATION
    stopGeneration() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.isGenerating = false;
        this.generateBtn.querySelector('.btn-text').style.display = 'inline';
        this.generateBtn.querySelector('.loader').style.display = 'none';
        this.generateBtn.disabled = false;
        this.enhanceBtn.disabled = false;
        this.stopBtn.style.display = 'none';
        this.loadingSection.style.display = 'none';
    }

    // SHOW ANIMATED LOADING MESSAGES DURING GENERATION
    showLoadingMessages() {
        const messages = [
            "Analyzing your request",
            "Writing HTML structure",
            "Designing CSS styles",
            "Adding JavaScript functionality",
            "Finalizing your website"
        ];
        let messageIndex = 0;
        const loadingText = this.loadingSection.querySelector('.loading-text');
        const messageInterval = setInterval(() => {
            if (!this.isGenerating) {
                clearInterval(messageInterval);
                return;
            }
            loadingText.textContent = messages[messageIndex];
            messageIndex = (messageIndex + 1) % messages.length;
        }, 2000);
    }

    // OPENROUTER API CALL
    async callOpenRouterAPI(prompt) {
        const systemPrompt = `You are an expert web developer. Your task is to generate a complete, visually stunning, and fully responsive website based on the user's description.

        Generate clean, semantic HTML, modern CSS with responsive design, and functional JavaScript if needed. The website should be:
        - Fully responsive (mobile-first design)
        - Modern and visually appealing
        - Accessible and SEO-friendly
        - Include proper meta tags
        - Use modern CSS features (flexbox, grid, etc.)
        - Include smooth animations and transitions
        - Follow best practices

        Return ONLY the code in this exact format:
        <!-- HTML_START -->
        [HTML code here]
        <!-- HTML_END -->

        <!-- CSS_START -->
        [CSS code here]
        <!-- CSS_END -->

        <!-- JS_START -->
        [JavaScript code here]
        <!-- JS_END -->

        Make sure the output is a complete, professional-grade website ready for deployment.`;
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getApiKey()}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'WebLlama'
            },
            body: JSON.stringify({
                model: this.modelSelect.value,
                messages: [{
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: prompt
                }
                ],
                temperature: 0.5,
            }),
            signal: this.abortController.signal
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;
    }

    // PARSE GENERATED HTML, CSS, JS CODE INTO EDITORS
    parseGeneratedCode(generatedCode) {
        const htmlMatch = generatedCode.match(/<!-- HTML_START -->([\s\S]*?)<!-- HTML_END -->/);
        this.currentFiles.html = htmlMatch ? htmlMatch[1].trim() : this.createFallbackHTML();
        const cssMatch = generatedCode.match(/<!-- CSS_START -->([\s\S]*?)<!-- CSS_END -->/);
        this.currentFiles.css = cssMatch ? cssMatch[1].trim() : this.createFallbackCSS();
        const jsMatch = generatedCode.match(/<!-- JS_START -->([\s\S]*?)<!-- JS_END -->/);
        this.currentFiles.js = jsMatch ? jsMatch[1].trim() : '';
        this.htmlEditor.value = this.currentFiles.html;
        this.cssEditor.value = this.currentFiles.css;
        this.jsEditor.value = this.currentFiles.js;
    }

    // CREATE FALLBACK HTML IF AI OUTPUT IS INVALID
    createFallbackHTML() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fallback Website</title>
            <style>
                /* CSS */
            </style>
        </head>
        <body>
            <header>
                <h1>Fallback Website</h1>
            </header>
            <main>
                <section>
                    <p>This is your Fallback website.</p>
                </section>
            </main>
            <footer>
                <p>&copy; 2025 Fallback Website</p>
            </footer>
        </body>
        </html>`;
    }

    // CREATE FALLBACK CSS IF AI OUTPUT IS INVALID
    createFallbackCSS() {
        return `* {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            color: #202020;
        }
        header {
            background: #202020;
            color: #FFFFFF;
            text-align: center;
            padding: 2rem;
        }
        main {
            padding: 2rem;
            text-align: center;
        }
        section {
            padding: 2rem;
        }
        section p {
            font-size: 1.5rem;
        }
        footer {
            background: #202020;
            color: #FFFFFF;
            text-align: center;
            padding: 2rem;
        }`;
    }

    // SHOW THE CODE EDITOR PANEL
    showEditor() {
        this.editorContainer.style.display = 'flex';
        this.editorContainer.scrollIntoView({
            behavior: 'smooth'
        });
        this.showHistory();
    }

    // SWITCH BETWEEN HTML, CSS, AND JS EDITOR TABS
    switchFile(fileType) {
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-file="${fileType}"]`).classList.add('active');
        this.htmlEditor.style.display = 'none';
        this.cssEditor.style.display = 'none';
        this.jsEditor.style.display = 'none';
        const editors = {
            html: this.htmlEditor,
            css: this.cssEditor,
            js: this.jsEditor
        };
        editors[fileType].style.display = 'block';
        this.activeFile = fileType;
    }

    // SWITCH PREVIEW FRAME BETWEEN MOBILE/TABLET/DESKTOP
    switchDevice(deviceType) {
        this.deviceBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-device="${deviceType}"]`).classList.add('active');
        this.previewFrame.className = `preview-frame ${deviceType}`;
    }

    // HANDLE MANUAL EDITS IN EDITORS
    onCodeChange(fileType) {
        const editors = {
            html: this.htmlEditor,
            css: this.cssEditor,
            js: this.jsEditor
        };
        this.currentFiles[fileType] = editors[fileType].value;
        this.updatePreview();
        this.saveCurrentState();
    }

    // UPDATE PREVIEW FRAME WITH COMBINED CODE
    updatePreview() {
        const combinedHTML = this.combineFiles();
        const blob = new Blob([combinedHTML], {
            type: 'text/html'
        });
        const url = URL.createObjectURL(blob);
        this.previewFrame.src = url;
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // COMBINE HTML, CSS, AND JS INTO A FULL HTML DOCUMENT
    combineFiles() {
        let html = this.currentFiles.html;
        if (this.currentFiles.css) {
            const cssTag = `<style>\n${this.currentFiles.css}\n</style>`;
            if (html.includes('</head>')) {
                html = html.replace('</head>', `${cssTag}\n</head>`);
            } else {
                html = `<head>${cssTag}</head>\n${html}`;
            }
        }
        if (this.currentFiles.js) {
            const jsTag = `<script>\n${this.currentFiles.js}\n</script>`;
            if (html.includes('</body>')) {
                html = html.replace('</body>', `${jsTag}\n</body>`);
            } else {
                html = `${html}\n${jsTag}`;
            }
        }
        return html;
    }

    // DOWNLOAD GENERATED WEBSITE AS A ZIP
    async downloadWebsite() {
        if (!this.currentFiles.html && !this.currentFiles.css && !this.currentFiles.js) {
            this.showStatus('No website to download. Generate a website first.', 'error');
            return;
        }
        try {
            const zip = new JSZip();
            zip.file('index.html', this.currentFiles.html || this.createFallbackHTML());
            zip.file('style.css', this.currentFiles.css || this.createFallbackCSS());
            if (this.currentFiles.js) {
                zip.file('script.js', this.currentFiles.js);
            }
            zip.file('README.md', `# Generated with WebLlama
            Generated on: ${new Date().toLocaleDateString()}
            Prompt: ${this.currentPrompt}
            ## Files Included:
            - index.html - Main HTML structure
            - style.css - CSS styling
            ${this.currentFiles.js ? '- script.js - JavaScript functionality' : ''}
            ## To use:
            1. Extract all files to a folder
            2. Open index.html in a web browser
            3. Customize as needed`);
            const content = await zip.generateAsync({
                type: 'blob'
            });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `webllama-project-${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.showStatus('Website downloaded successfully!', 'success');
        } catch (error) {
            this.showStatus('Error downloading website.', 'error');
        }
    }

    // SHOW STATUS MESSAGES
    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.display = 'block';
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                this.statusMessage.style.display = 'none';
            }, 5000);
        }
    }

    // GET WEBSITE GENERATION HISTORY FROM LOCALSTORAGE
    getHistory() {
        const stored = localStorage.getItem('webllama_history');
        return stored ? JSON.parse(stored) : [];
    }

    // SAVE NEWLY GENERATED WEBSITE TO HISTORY
    saveToHistory(prompt, model, files) {
        const historyItem = {
            id: Date.now(),
            prompt: prompt,
            model: model,
            files: files,
            timestamp: new Date().toLocaleTimeString(
                'en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            date: new Date().toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata'
            })
        };

        let history = this.getHistory();
        history.unshift(historyItem);
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        localStorage.setItem('webllama_history', JSON.stringify(history));
        this.renderHistory();
    }

    // LOAD WEBSITE FROM HISTORY
    loadFromHistory(historyId) {
        const history = this.getHistory();
        const item = history.find(h => h.id === historyId);
        if (item) {
            this.currentFiles = {
                ...item.files
            };
            this.htmlEditor.value = item.files.html || '';
            this.cssEditor.value = item.files.css || '';
            this.jsEditor.value = item.files.js || '';
            this.promptInput.value = item.prompt;
            this.modelSelect.value = item.model;
            this.switchFile('html');
            this.showEditor();
            this.updatePreview();
            this.showStatus('Website loaded from history!', 'success');
        }
    }

    // DELETE A WEBSITE FROM HISTORY
    deleteFromHistory(historyId) {
        const deletedItem = this.getHistory().find(i => i.id === historyId);
        let history = this.getHistory().filter(i => i.id !== historyId);
        localStorage.setItem('webllama_history', JSON.stringify(history));
        this.renderHistory();
        this.showStatus('Item deleted from history', 'info');
        if (deletedItem && this.currentPrompt === deletedItem.prompt) {
            this.currentFiles = {
                html: '',
                css: '',
                js: ''
            };
            this.htmlEditor.value = '';
            this.cssEditor.value = '';
            this.jsEditor.value = '';
            this.previewFrame.src = '';
        }
    }

    // CLEAR ENTIRE HISTORY AND RESET
    clearHistory() {
        localStorage.clear();
        this.currentFiles = {
            html: '',
            css: '',
            js: ''
        };
        this.currentPrompt = '';
        this.htmlEditor.value = '';
        this.cssEditor.value = '';
        this.jsEditor.value = '';
        this.previewFrame.src = '';
        if (this.historyGrid)
            this.historyGrid.innerHTML =
                '<div class="no-history">No generation history yet.</div>';
        this.editorContainer.style.display = 'none';
        this.showStatus('All local storage cleared.', 'info');
    }

    // RENDER HISTORY ITEMS IN THE LIST
    renderHistory() {
        const history = this.getHistory();
        if (!this.historyGrid) return;
        if (history.length === 0) {
            this.historyGrid.innerHTML = '<div class="no-history">No generation history yet.</div>';
            return;
        }
        this.historyGrid.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-item-date">
                        ${item.date} ${item.timestamp}
                    </span>
                    <div class="history-item-actions">
                        <button class="btn-load" onclick="websiteBuilder.loadFromHistory(${item.id})">Load</button>
                        <button class="btn-delete" onclick="websiteBuilder.deleteFromHistory(${item.id})">Delete</button>
                    </div>
                </div>
                <div class="history-item-prompt">${item.prompt}</div>
                <div class="history-item-model">${item.model}</div>
            </div>
        `).join('');
    }

    // SHOW HISTORY SECTION
    showHistory() {
        if (this.historySection) {
            this.historySection.style.display = 'block';
            this.renderHistory();
        }
    }

    // HIDE HISTORY SECTION
    hideHistory() {
        if (this.historySection) {
            this.historySection.style.display = 'none';
        }
    }

    // SAVE CURRENT STATE TO LOCALSTORAGE
    saveCurrentState() {
        if (this.currentFiles.html || this.currentFiles.css || this.currentFiles.js) {
            const currentState = {
                prompt: this.currentPrompt,
                model: this.modelSelect.value,
                files: this.currentFiles
            };
            localStorage.setItem('webllama_current_state', JSON.stringify(currentState));
        }
    }

    // LOAD CURRENT STATE FROM LOCALSTORAGE
    loadCurrentState() {
        const stored = localStorage.getItem('webllama_current_state');
        if (stored) {
            const state = JSON.parse(stored);
            this.currentFiles = state.files || {
                html: '',
                css: '',
                js: ''
            };
            this.currentPrompt = state.prompt || '';
            if (state.model) {
                this.modelSelect.value = state.model;
            }
            if (this.currentFiles.html) {
                this.htmlEditor.value = this.currentFiles.html;
                this.cssEditor.value = this.currentFiles.css;
                this.jsEditor.value = this.currentFiles.js;
                this.showEditor();
                this.updatePreview();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.websiteBuilder = new AIWebsiteBuilder();
});

// FULLSCREEN PREVIEW
const previewFrame = document.getElementById('previewFrame');
const fullscreenBtn = document.getElementById('fullscreenBtn');

fullscreenBtn.addEventListener('click', function () {
    let elem = previewFrame;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
});
