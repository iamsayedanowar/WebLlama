![WebLlama](https://raw.githubusercontent.com/iamsayedanowar/WebLlama/refs/heads/main/GRP.png)

# WebLlama - From Prompt to Website
#### Video Demo: https://youtu.be/pG62fvNqP7s
#### Live Demo: https://webllama.netlify.app/
#### Source Code: https://github.com/iamsayedanowar/WebLlama
#### Author: Sayed Anowar

## Description

WebLlama is an open-source web application that empowers users to instantly generate and edit complete websites using AI. You can provide a prompt describing your desired website, choose a model (like DeepSeek, Qwen3, Gemini, etc.), and generate a fully functional website with editable HTML, CSS, and JavaScript files. The app includes live preview, multi-device view, prompt enhancement, and instant project download.

## Features

1. **AI Website Generation**
   - Users can enter a prompt describing the kind of website they want.
   - The application sends the request to the OpenRouter API, which supports models such as DeepSeek, Qwen3, Gemini, and others.
   - The model responds with code for three separate files: HTML, CSS, and JavaScript.

2. **Live Code Editing**
   - After generation, the code is placed into an editor with three tabs for HTML, CSS, and JavaScript.
   - Users can freely edit the code directly in the browser.
   - Any changes are reflected instantly in the preview panel.

3. **Live Preview with Multi-Device View**
   - The preview updates automatically whenever the code changes.
   - Users can switch between desktop, tablet, and mobile views to see how their website looks across devices.

4. **Prompt Enhancement**
   - Sometimes users may type incomplete prompts. WebLlama includes a feature that uses AI to refine or enhance the prompt, giving better results.

5. **Download as ZIP**
   - Once satisfied with the generated website, users can download all files as a ZIP package and host it anywhere.

6. **Local Storage & History**
   - Previous generations are stored in the browser’s local storage.
   - Users can revisit older projects, reload them, or delete/edit them as needed.

7. **No Server Dependency**
   - WebLlama runs entirely on the client side.
   - The API key is stored in session memory only; it is never sent to any server or saved permanently.

## Instructions

You need to provide your `OpenRouter API key` to enable website generation via AI models. Simply enter your `OpenRouter API key` in the `API` input section directly on the website.

1. Visit the WebLlama site.
2. Enter your `OpenRouter API key` in the provided input box.
   - If you don’t have an API key yet, you can get one for free from [OpenRouter.ai](https://openrouter.ai/settings/keys).
   - Your API key is stored only in your browser session and is never saved remotely or exposed publicly.
3. Type a description of the website you want in the prompt box.
4. Select the AI model you would like to use.
5. Click **Generate**. The AI will process your request and produce a complete website.
6. Edit the generated code in the HTML, CSS, and JS editor if you want to customize it.
7. View the changes instantly in the live preview window.
8. When you are satisfied, click **Download** to save your website as a ZIP file.

## Tech Stack

WebLlama is built entirely with **HTML, CSS, and JavaScript**.

- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **API:** `OpenRouter API`

## File Structure

```
WebLlama/
├── index.html
├── style.css
├── script.js
├── README.md
├── webllama.png
├── svg/
    ├── device-desktop.svg
    ├── device-mobile.svg
    ├── device-tablet.svg
    ├── download.svg
    ├── external-link.svg
    ├── maximize.svg
    ├── refresh.svg
```

## Design Decisions

When building WebLlama, I made several design choices to balance usability and functionality:

- **Why OpenRouter ?**
  - OpenRouter offers access to multiple AI models under one API, making it flexible and future-proof.
- **Why client-side only ?**
  - I designed it as a fully front-end application so users do not need to set up a server. This also makes the project lightweight and easier to host.
- **Local Storage for History**: Instead of storing history on a server, I used the browser’s local storage. This means the project data stays with the user, enhancing privacy.
- **User-Friendly UI**: The interface is designed to be simple so that even users without technical skills can generate websites quickly.
- **Multi-Device Preview**: Since responsive design is a key part of modern web development, I added the ability to preview sites across different screen sizes.
- **Fallback HTML/CSS**: In case the AI produces incomplete output, the app uses fallback templates so the preview never breaks.

## Testing

- Generate with multiple models
- Generating projects with short and long prompts, with and without enhancement.
- Toggle device sizes and check responsive behavior with CSS media queries.
- Download a ZIP; unzip and open `index.html` to confirm the project works offline.

## How to Run

1. Clone or download the repository

   ```bash
   https://github.com/iamsayedanowar/WebLlama.git
   ```
   ```bash
   https://github.com/iamsayedanowar/WebLlama/archive/refs/heads/main.zip
   ```

2. Extract the project anywhere and open `index.html` in a modern browser.
3. Enter an `OpenRouter API` key in the `API` input section.
4. Write a prompt, choose a model, and click `Generate`.
