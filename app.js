(() => {
  'use strict';

  const config = window.RAPVILLE_CONFIG || {};
  const currentYear = document.getElementById('current-year');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  // Mobile navigation
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
      mobileNav.hidden = expanded;
    });
    mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      mobileNav.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  // Lead form: three intentional steps, contact information first.
  const leadForm = document.getElementById('lead-form');
  const formSteps = Array.from(document.querySelectorAll('[data-form-step]'));
  const stepCurrent = document.getElementById('step-current');
  const progressBar = document.getElementById('progress-bar');
  const formStatus = document.getElementById('form-status');
  const formSuccess = document.getElementById('form-success');
  const submitLead = document.getElementById('submit-lead');
  const bookCallLink = document.getElementById('book-call-link');
  let activeStep = 0;

  function showFormStep(index) {
    activeStep = Math.max(0, Math.min(index, formSteps.length - 1));
    formSteps.forEach((step, i) => {
      step.hidden = i !== activeStep;
      step.classList.toggle('is-active', i === activeStep);
    });
    if (stepCurrent) stepCurrent.textContent = String(activeStep + 1).padStart(2, '0');
    if (progressBar) progressBar.style.width = `${((activeStep + 1) / formSteps.length) * 100}%`;
    if (formStatus) formStatus.textContent = '';
  }

  function validateVisibleStep() {
    const current = formSteps[activeStep];
    if (!current) return true;
    const inputs = Array.from(current.querySelectorAll('input, select, textarea'))
      .filter((field) => !field.disabled && field.type !== 'hidden' && field.name !== 'website');
    const radioGroups = new Set(inputs.filter((field) => field.type === 'radio').map((field) => field.name));
    for (const field of inputs) {
      if (field.type === 'radio') continue;
      if (field.required && !field.checkValidity()) {
        field.reportValidity();
        field.focus({ preventScroll: true });
        return false;
      }
      if (field.type === 'url' && field.value.trim() && !field.checkValidity()) {
        field.reportValidity();
        field.focus({ preventScroll: true });
        return false;
      }
    }
    for (const name of radioGroups) {
      const radios = inputs.filter((field) => field.name === name);
      if (radios.some((field) => field.required) && !radios.some((field) => field.checked)) {
        const first = radios[0];
        const label = current.querySelector(`fieldset legend`);
        if (formStatus) formStatus.textContent = `Please select an option${label ? ` for ${label.textContent.toLowerCase()}` : ''}.`;
        first.focus({ preventScroll: true });
        return false;
      }
    }
    return true;
  }

  document.querySelectorAll('.form-next').forEach((button) => button.addEventListener('click', () => {
    if (validateVisibleStep()) showFormStep(activeStep + 1);
  }));
  document.querySelectorAll('.form-back').forEach((button) => button.addEventListener('click', () => showFormStep(activeStep - 1)));

  function formPayload() {
    const fd = new FormData(leadForm);
    const data = {};
    for (const [key, value] of fd.entries()) {
      if (key === 'goal') data[key] = value;
      else data[key] = typeof value === 'string' ? value.trim() : value;
    }
    data.consent = fd.get('consent') === 'on';
    data.source = 'website-growth-form';
    data.pageUrl = window.location.href;
    return data;
  }

  async function postLead(payload) {
    // GitHub Pages is static: send to an explicitly configured form service if supplied.
    // Never put private API keys in this client-side config.
    if (config.formEndpoint && /^https:\/\//i.test(config.formEndpoint)) {
      const response = await fetch(config.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The form service could not accept this enquiry. Please try again.');
      return { ...data, demo: false };
    }

    // Preview behaviour: retain only a handful of test submissions on this visitor's own browser.
    // Nothing is emailed or sent to RAPVILLE until formEndpoint has been configured.
    try {
      const storageKey = 'rapville_github_pages_demo_leads_v1';
      const prior = JSON.parse(localStorage.getItem(storageKey) || '[]');
      prior.push({ ...payload, _demoSavedAt: new Date().toISOString() });
      localStorage.setItem(storageKey, JSON.stringify(prior.slice(-5)));
    } catch (_storageError) {
      // Private-browsing policies can disable local storage; the demo flow should still be testable.
    }
    return { demo: true };
  }

  if (leadForm) {
    leadForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!validateVisibleStep()) return;
      const payload = formPayload();
      if (submitLead) {
        submitLead.disabled = true;
        submitLead.dataset.originalText = submitLead.textContent;
        submitLead.textContent = 'Sending…';
      }
      if (formStatus) {
        formStatus.textContent = '';
        formStatus.classList.remove('is-success');
      }
      try {
        const submission = await postLead(payload);
        leadForm.hidden = true;
        formSuccess.hidden = false;
        if (formStatus) formStatus.textContent = '';
        const successEyebrow = document.getElementById('success-eyebrow');
        const successTitle = document.getElementById('success-title');
        const successCopy = document.getElementById('form-success-copy');
        if (submission.demo) {
          if (successEyebrow) successEyebrow.textContent = 'DEMO MODE / LOCAL ONLY';
          if (successTitle) successTitle.textContent = 'The form works — delivery is not connected yet.';
          if (successCopy) successCopy.textContent = 'Your test enquiry was saved only in this browser when local storage is available. It has not been sent to RAPVILLE. Add a real form endpoint in config.js to receive enquiries.';
        } else {
          if (successEyebrow) successEyebrow.textContent = 'ENQUIRY SUBMITTED';
          if (successTitle) successTitle.textContent = 'That’s the first step.';
          if (successCopy) successCopy.textContent = 'Thanks for sharing the details. Your enquiry was sent to the configured form service. The RAPVILLE team can follow up if that service is connected to their inbox or CRM.';
        }
        if (config.bookingUrl && /^https:\/\//i.test(config.bookingUrl)) {
          bookCallLink.href = config.bookingUrl;
          bookCallLink.hidden = false;
        } else {
          bookCallLink.hidden = true;
        }
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (error) {
        if (formStatus) formStatus.textContent = `${error.message} Please retry or confirm the formEndpoint in config.js is correct.`;
      } finally {
        if (submitLead) {
          submitLead.disabled = false;
          submitLead.textContent = 'Request a strategy call ↗';
        }
      }
    });
  }
  document.getElementById('reset-form')?.addEventListener('click', () => {
    leadForm.reset();
    leadForm.hidden = false;
    formSuccess.hidden = true;
    showFormStep(0);
  });

  // Contact-first chatbot. It works with built-in answers if no LLM key is configured.
  const chatLauncher = document.getElementById('chat-launcher');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close');
  const chatBody = document.getElementById('chat-body');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = [];
  const leadSession = { name: '', email: '', phone: '', consent: false, saved: false };
  let chatStage = 'intro';
  let sendingChat = false;

  const answers = [
    { keys: ['service', 'do you do', 'what do you do', 'offer'], answer: 'RAPVILLE brings artist strategy, content concepts, filming and short-form editing into one joined-up system. The aim is to help your music find more of the right people—not just publish more posts.' },
    { keys: ['viral', 'guarantee', 'views', 'followers'], answer: 'No one can guarantee a viral post. RAPVILLE works on the parts you can influence: artist positioning, hooks, creative concepts, production and learning from audience response. The case snapshots on this page are examples, not a promise of your results.' },
    { keys: ['price', 'pricing', 'cost', 'budget', 'how much'], answer: 'Pricing depends on the scope of strategy, filming and editing. There is no fixed price list on this page. Share your project and working budget in the enquiry form, and the team can discuss what is realistic.' },
    { keys: ['platform', 'tiktok', 'instagram', 'reels', 'shorts', 'youtube'], answer: 'The content plan can consider Instagram Reels, TikTok and YouTube Shorts. The best mix depends on your audience, artist identity and campaign goal.' },
    { keys: ['location', 'shoot', 'film', 'where', 'london', 'usa', 'uk'], answer: 'RAPVILLE’s current materials list production crews in Los Angeles, New York, Miami, London, Dubai and Europe. Availability for a specific shoot should be confirmed with the team.' },
    { keys: ['start', 'call', 'book', 'next step', 'contact', 'apply'], answer: 'The fastest next step is to fill in the growth inquiry on this page. It asks about your artist/project, goal, timing and contact details. A scheduling link can be added to this demo once RAPVILLE provides its real booking URL.' },
    { keys: ['label', 'manager', 'artist', 'genre', 'work with'], answer: 'The enquiry is open to artists, artist managers, creative teams and labels. Tell the team your genre, current position and what you want the next release or content cycle to achieve.' },
    { keys: ['prepare', 'need', 'bring', 'before'], answer: 'A link to your music or social profile, your next release date (if you have one), examples of content you like, and one clear goal are enough to start.' },
    { keys: ['ad', 'ads', 'paid'], answer: 'The supplied RAPVILLE training page positions the content formula as organic-first. For your project, the strategy conversation can clarify what role (if any) paid promotion should play.' }
  ];

  function addChatMessage(text, sender = 'bot') {
    const node = document.createElement('div');
    node.className = `chat-message ${sender}`;
    node.textContent = text;
    chatBody.appendChild(node);
    chatBody.scrollTop = chatBody.scrollHeight;
    // Never send the contact-collection exchange (including name/email/phone) to the LLM.
    if (chatStage === 'questions' && sender === 'user') chatHistory.push({ role: 'user', content: text });
    else if (chatStage === 'questions' && sender === 'bot') chatHistory.push({ role: 'assistant', content: text });
    if (chatHistory.length > 16) chatHistory.splice(0, chatHistory.length - 16);
    return node;
  }

  function addQuickReplies(labels) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-quick-replies';
    labels.forEach((label) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => {
        wrap.remove();
        handleChatInput(label);
      });
      wrap.appendChild(button);
    });
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function setChatStage(stage, prompt) {
    chatStage = stage;
    if (prompt) addChatMessage(prompt, 'bot');
    if (chatInput) {
      const placeholders = {
        name: 'Your name…', email: 'you@example.com', phone: 'Phone / WhatsApp…', questions: 'Ask a question…', intro: 'Choose an option…'
      };
      chatInput.placeholder = placeholders[stage] || 'Type your answer…';
      chatInput.type = stage === 'email' ? 'email' : 'text';
      chatInput.autocomplete = stage === 'email' ? 'email' : stage === 'name' ? 'name' : stage === 'phone' ? 'tel' : 'off';
      chatInput.focus({ preventScroll: true });
    }
  }

  function showFaqOptions() {
    setChatStage('questions', 'Thanks — I’ve got the basics. What would you like to know?');
    addQuickReplies(['Services', 'Pricing', 'Can you guarantee viral?', 'Platforms', 'Locations', 'Book a call']);
  }

  async function saveChatLead() {
    try {
      const result = await postLead({
        name: leadSession.name,
        email: leadSession.email,
        phone: leadSession.phone,
        artistName: '',
        role: 'Website chatbot visitor',
        goal: 'Initial chatbot enquiry',
        consent: true,
        source: 'website-chatbot',
        pageUrl: window.location.href
      });
      leadSession.saved = true;
      if (result.demo) {
        addChatMessage('Thanks — your details have been captured for this browser demo only. No one at RAPVILLE has been notified yet. The site owner needs to connect the form endpoint before launch.');
      } else {
        addChatMessage('Thanks — your enquiry was sent to the configured form service. Ask me anything below.');
      }
    } catch (_error) {
      leadSession.saved = false;
      addChatMessage('I couldn’t send those details to the configured service just now. You can still ask common questions, or use the growth inquiry form again later.');
    }
  }

  function localAnswer(query) {
    const normalized = query.toLowerCase();
    const match = answers.find((entry) => entry.keys.some((key) => normalized.includes(key)));
    if (match) return match.answer;
    return 'I can help with RAPVILLE’s services, pricing approach, platforms, process and getting started. For a question specific to your project or availability, the team will need to confirm it. You can also leave the details in the growth inquiry form.';
  }

  async function askAssistant(query) {
    const loading = addChatMessage('One sec — let me think…', 'bot');
    try {
      if (config.chatEndpoint && /^https:\/\//i.test(config.chatEndpoint)) {
        const response = await fetch(config.chatEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, history: chatHistory.slice(0, -2).slice(-8).filter((item) => item.content !== 'One sec — let me think…') })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Chat unavailable');
        loading.textContent = data.reply || localAnswer(query);
      } else {
        loading.textContent = localAnswer(query);
      }
    } catch (_error) {
      loading.textContent = localAnswer(query);
    }
    chatBody.scrollTop = chatBody.scrollHeight;
    addQuickReplies(['Services', 'Pricing', 'Can you guarantee viral?', 'Book a call']);
  }

  async function handleChatInput(rawText) {
    const text = String(rawText || '').trim();
    if (!text || sendingChat) return;
    sendingChat = true;
    addChatMessage(text, 'user');
    if (chatStage === 'intro') {
      if (/not now|no thanks|later/i.test(text)) {
        setChatStage('intro-declined', 'No problem. The FAQ section on the page is available without sharing details. If you want me to help here, choose Start first.');
        addQuickReplies(['Start', 'Close chat']);
      } else {
        setChatStage('name', 'First, what name should I use?');
      }
    } else if (chatStage === 'name') {
      if (text.length < 2) {
        addChatMessage('Please enter at least two characters so I know what to call you.');
      } else {
        leadSession.name = text.slice(0, 120);
        setChatStage('email', 'Thanks. What’s the best email address to reach you?');
      }
    } else if (chatStage === 'email') {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      if (!validEmail) addChatMessage('That email doesn’t look quite right. Please enter an address like you@example.com.');
      else {
        leadSession.email = text.slice(0, 254);
        setChatStage('phone', 'And your phone number or WhatsApp number, including country code if possible?');
      }
    } else if (chatStage === 'phone') {
      const phoneDigits = text.replace(/\D/g, '');
      if (phoneDigits.length < 7) addChatMessage('Please enter a phone number with at least 7 digits, including a country code where possible.');
      else {
        leadSession.phone = text.slice(0, 40);
        await saveChatLead();
        showFaqOptions();
      }
    } else if (chatStage === 'intro-declined') {
      if (/^start$/i.test(text)) setChatStage('name', 'First, what name should I use?');
      else if (/close chat/i.test(text)) closeChat();
      else { addChatMessage('To continue the chat, choose Start. You can also read the FAQ section without sharing contact details.'); addQuickReplies(['Start', 'Close chat']); }
    } else if (chatStage === 'questions') {
      if (!leadSession.name || !leadSession.email || !leadSession.phone) {
        if (/^start$/i.test(text)) setChatStage('name', 'First, what name should I use?');
        else if (/close chat/i.test(text)) closeChat();
        else { addChatMessage('I can help here once you share your name, email and phone/WhatsApp. You can also use the on-page FAQs without sharing details.'); addQuickReplies(['Start', 'Close chat']); }
      } else if (/^start$/i.test(text)) setChatStage('name', 'First, what name should I use?');
      else if (/close chat/i.test(text)) closeChat();
      else if (/^book a call$/i.test(text)) {
        addChatMessage(config.bookingUrl && /^https:\/\//i.test(config.bookingUrl)
          ? `Use the RAPVILLE booking page here: ${config.bookingUrl}`
          : 'To request a call, fill out the growth inquiry form on this page. Add RAPVILLE’s real Calendly or Cal.com link to public/config.js to enable direct scheduling after submission.');
        addQuickReplies(['Open growth form', 'Services', 'Pricing']);
      } else if (/^open growth form$/i.test(text)) {
        closeChat();
        document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        await askAssistant(text);
      }
    } else {
      showFaqOptions();
    }
    sendingChat = false;
  }

  function openChat() {
    chatPanel.hidden = false;
    chatLauncher.setAttribute('aria-expanded', 'true');
    chatLauncher.setAttribute('aria-label', 'Close RAPVILLE assistant');
    chatLauncher.querySelector('.chat-launcher-label').textContent = 'Close assistant';
    if (chatStage === 'intro' && chatBody.dataset.started !== 'yes') {
      chatBody.dataset.started = 'yes';
      addChatMessage('Hey 👋 I’m the RAPVILLE assistant. I can answer common questions and help route your enquiry.');
      addChatMessage('Before I help, I ask for your name, email and phone/WhatsApp so the team can follow up if needed. By continuing, you agree RAPVILLE may contact you about this enquiry. See the Privacy Notice for details.');
      addQuickReplies(['Continue', 'Not now']);
      chatInput.placeholder = 'Choose an option…';
    }
    chatInput.focus({ preventScroll: true });
  }
  function closeChat() {
    chatPanel.hidden = true;
    chatLauncher.setAttribute('aria-expanded', 'false');
    chatLauncher.setAttribute('aria-label', 'Open RAPVILLE assistant');
    chatLauncher.querySelector('.chat-launcher-label').textContent = 'Ask RAPVILLE';
  }
  chatLauncher?.addEventListener('click', () => chatPanel.hidden ? openChat() : closeChat());
  chatClose?.addEventListener('click', closeChat);
  chatForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = chatInput.value;
    chatInput.value = '';
    await handleChatInput(text);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && chatPanel && !chatPanel.hidden) closeChat();
  });

  // Prevent inert-looking video overlay if visitors start playback.
  document.querySelectorAll('.video-frame video').forEach((video) => {
    video.addEventListener('play', () => {
      const hint = video.parentElement.querySelector('.video-play-hint');
      if (hint) hint.style.opacity = '0';
    });
    video.addEventListener('pause', () => {
      const hint = video.parentElement.querySelector('.video-play-hint');
      if (hint) hint.style.opacity = '';
    });
  });
})();
