// ==UserScript==
// @name         Webpage to Markdown Downloader
// @namespace    https://github.com/Rosoe/Webpage-to-Markdown-Downloader/
// @version      1.1
// @description  Downloads the current webpage as a markdown file
// @author       Ro'sø
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Add download button to page
    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '📥 Download as Markdown';
    downloadBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 10px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: Arial, sans-serif;
    `;
    document.body.appendChild(downloadBtn);

    // Convert HTML to Markdown
    function htmlToMarkdown(element) {
        let markdown = '';
        
        // Process children recursively
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                markdown += node.textContent.trim();
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                
                switch (tagName) {
                    case 'h1':
                        markdown += `\n# ${node.textContent.trim()}\n\n`;
                        break;
                    case 'h2':
                        markdown += `\n## ${node.textContent.trim()}\n\n`;
                        break;
                    case 'h3':
                        markdown += `\n### ${node.textContent.trim()}\n\n`;
                        break;
                    case 'p':
                        markdown += `\n${node.textContent.trim()}\n\n`;
                        break;
                    case 'a':
                        markdown += `[${node.textContent.trim()}](${node.href})`;
                        break;
                    case 'strong':
                    case 'b':
                        markdown += `**${node.textContent.trim()}**`;
                        break;
                    case 'em':
                    case 'i':
                        markdown += `*${node.textContent.trim()}*`;
                        break;
                    case 'ul':
                        markdown += '\n';
                        Array.from(node.children).forEach(li => {
                            markdown += `* ${li.textContent.trim()}\n`;
                        });
                        markdown += '\n';
                        break;
                    case 'ol':
                        markdown += '\n';
                        Array.from(node.children).forEach((li, index) => {
                            markdown += `${index + 1}. ${li.textContent.trim()}\n`;
                        });
                        markdown += '\n';
                        break;
                    case 'img':
                        markdown += `![${node.alt || 'image'}](${node.src})`;
                        break;
                    case 'code':
                        markdown += `\`${node.textContent.trim()}\``;
                        break;
                    case 'pre':
                        markdown += `\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n\n`;
                        break;
                    case 'blockquote':
                        markdown += `\n> ${node.textContent.trim()}\n\n`;
                        break;
                    case 'hr':
                        markdown += '\n---\n\n';
                        break;
                    default:
                        markdown += htmlToMarkdown(node);
                }
            }
        }
        return markdown;
    }

    // Download markdown file
    function downloadMarkdown() {
        // Get main content
        const content = document.querySelector('main') || document.querySelector('article') || document.body;
        
        // Convert to markdown
        let markdown = htmlToMarkdown(content);
        
        // Clean up markdown (remove excessive newlines and spaces)
        markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
        
        // Get title for filename
        const title = document.querySelector('h1')?.textContent.trim() || 
                     document.title.trim() || 
                     'webpage';
                     
        // Clean filename
        const filename = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') + '.md';
            
        // Create and trigger download
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Add click handler
    downloadBtn.addEventListener('click', downloadMarkdown);
})();
