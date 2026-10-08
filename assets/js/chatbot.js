(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const WORKER_URL = 'https://portfolio-chatbot-worker.hfz-aiman0307.workers.dev';
  let isOpen = false;
  let isTyping = false;

  const chatbotButton = $('#chatbot-button');
  const chatbotPanel = $('#chatbot-panel');
  const chatbotHeader = $('#chatbot-header');
  const chatbotMessages = $('#chatbot-messages');
  const chatbotInput = $('#chatbot-input');
  const chatbotSend = $('#chatbot-send');
  const chatbotClose = $('#chatbot-close');
  const chatbotPrompts = $('#chatbot-prompts');
  const chatbotTeaser = $('#chatbot-teaser');
  const chatbotTeaserClose = $('.chatbot-teaser__close');
  const chatbotRing = $('.chatbot-button__ring');

  if (!chatbotButton || !chatbotPanel || !chatbotMessages || !chatbotInput || !chatbotSend) {
    return;
  }

  const addMessage = (text, isUser = false) => {
    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${isUser ? 'chatbot-message--user' : 'chatbot-message--bot'}`;

    const contentEl = document.createElement('div');
    contentEl.className = 'chatbot-message__content';
    contentEl.textContent = text;

    const timeEl = document.createElement('span');
    timeEl.className = 'chatbot-message__time';
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageEl.appendChild(contentEl);
    messageEl.appendChild(timeEl);
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

  const sendMessage = async (text) => {
    const message = text || chatbotInput.value.trim();
    if (!message || isTyping) return;

    chatbotInput.value = '';
    addMessage(message, true);

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
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', false);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      removeTypingIndicator();
      addMessage('Having trouble connecting. Please try again.', false);
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
      addMessage("Hi! I'm Bo. Ask me about Hafiz's skills, projects, experience, or availability.", false);
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
  chatbotSend.addEventListener('click', () => sendMessage());

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
    if (isOpen) closeChatbot();
    else openChatbot();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeChatbot();
  });

  // Quick prompt chips
  if (chatbotPrompts) {
    const chips = chatbotPrompts.querySelectorAll('.chatbot-prompt-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt) sendMessage(prompt);
      });
    });
  }

  // Teaser bubble + pulsing ring
  if (chatbotTeaser && chatbotRing) {
    let teaserDismissed = false;

    const hideTeaser = () => {
      if (teaserDismissed) return;
      teaserDismissed = true;
      chatbotTeaser.classList.remove('is-visible');
      chatbotTeaser.setAttribute('aria-hidden', 'true');
      chatbotRing.classList.remove('is-visible');
    };

    const showTeaser = () => {
      if (teaserDismissed || isOpen) return;
      chatbotTeaser.classList.add('is-visible');
      chatbotTeaser.setAttribute('aria-hidden', 'false');
      chatbotRing.classList.add('is-visible');
    };

    // Show after 3 seconds
    setTimeout(showTeaser, 3000);

    // Auto-hide after 10 more seconds
    setTimeout(hideTeaser, 13000);

    // Dismiss on close button
    if (chatbotTeaserClose) {
      chatbotTeaserClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hideTeaser();
      });
    }

    // Dismiss on scroll
    window.addEventListener('scroll', hideTeaser, { once: true, passive: true });

    // Dismiss when chat is opened
    chatbotButton.addEventListener('click', hideTeaser);

    // Clicking the teaser opens the chat
    chatbotTeaser.addEventListener('click', (e) => {
      if (e.target === chatbotTeaserClose || chatbotTeaserClose.contains(e.target)) return;
      hideTeaser();
      openChatbot();
    });
  }
})();
