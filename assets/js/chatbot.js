(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const WORKER_URL = 'https://portfolio-chatbot-worker.hfz-aiman0307.workers.dev';
  let isOpen = false;
  let isTyping = false;
  let messageHistory = [];

  const chatbotButton = $('#chatbot-button');
  const chatbotPanel = $('#chatbot-panel');
  const chatbotHeader = $('#chatbot-header');
  const chatbotMessages = $('#chatbot-messages');
  const chatbotInput = $('#chatbot-input');
  const chatbotSend = $('#chatbot-send');
  const chatbotClose = $('#chatbot-close');

  if (!chatbotButton || !chatbotPanel || !chatbotMessages || !chatbotInput || !chatbotSend) {
    return;
  }

  const addMessage = (text, isUser = false) => {
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${isUser ? 'chatbot-message--user' : 'chatbot-message--bot'}`;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'chatbot-message__content';
    contentEl.textContent = text;
    
    messageEl.appendChild(contentEl);
    chatbotMessages.appendChild(messageEl);
    
    scrollToBottom();
    return messageEl;
  };

  const addTypingIndicator = () => {
    const typingEl = document.createElement('div');
    typingEl.className = 'chatbot-message chatbot-message--bot chatbot-message--typing';
    typingEl.id = 'typing-indicator';
    
    const contentEl = document.createElement('div');
    contentEl.className = 'chatbot-message__content';
    
    const dots = document.createElement('span');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    
    contentEl.appendChild(dots);
    typingEl.appendChild(contentEl);
    chatbotMessages.appendChild(typingEl);
    scrollToBottom();
    
    return typingEl;
  };

  const removeTypingIndicator = () => {
    const typingEl = $('#typing-indicator');
    if (typingEl) typingEl.remove();
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    });
  };

  const sendMessage = async () => {
    const message = chatbotInput.value.trim();
    if (!message || isTyping) return;

    chatbotInput.value = '';
    addMessage(message, true);
    messageHistory.push({ role: 'user', content: message });

    isTyping = true;
    chatbotSend.disabled = true;
    chatbotInput.disabled = true;
    addTypingIndicator();

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      removeTypingIndicator();
      
      if (data.response) {
        addMessage(data.response, false);
        messageHistory.push({ role: 'assistant', content: data.response });
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', false);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      removeTypingIndicator();
      addMessage('Sorry, I\'m having trouble connecting. Please check your connection and try again.', false);
    } finally {
      isTyping = false;
      chatbotSend.disabled = false;
      chatbotInput.disabled = false;
      chatbotInput.focus();
    }
  };

  const openChatbot = () => {
    if (isOpen) return;
    isOpen = true;
    chatbotPanel.classList.add('is-open');
    chatbotButton.setAttribute('aria-expanded', 'true');
    chatbotInput.focus();
    
    if (chatbotMessages.children.length === 0) {
      addMessage('Hello! I\'m Bo I can help you learn about Hafiz, his skills, projects, and how to contact him. How can I help you?', false);
    }
  };

  const closeChatbot = () => {
    if (!isOpen) return;
    isOpen = false;
    chatbotPanel.classList.remove('is-open');
    chatbotButton.setAttribute('aria-expanded', 'false');
  };

  chatbotButton.addEventListener('click', () => {
    if (isOpen) closeChatbot();
    else openChatbot();
  });

  chatbotClose.addEventListener('click', closeChatbot);

  chatbotSend.addEventListener('click', sendMessage);

  chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  chatbotHeader.addEventListener('click', (e) => {
    if (e.target === chatbotHeader || e.target.closest('#chatbot-close')) {
      return;
    }
    if (isOpen) {
      closeChatbot();
    } else {
      openChatbot();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeChatbot();
    }
  });
})();

