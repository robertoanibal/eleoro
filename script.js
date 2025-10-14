/*
 * Main JavaScript file for the eleoro website.
 *
 * Contains interactive behaviours such as sticky
 * navigation styling, mobile menu toggling, typed text
 * animations, skill progress bar activation and a simple
 * client-side contact form handler. All scripts are
 * wrapped within a DOMContentLoaded event listener to
 * ensure the DOM is ready before any elements are
 * queried or manipulated.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* Sticky navigation styling on scroll */
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  /* Mobile hamburger menu toggle */
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // Close menu when a navigation link is clicked on mobile
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* Typed animation removed for a simpler hero. A static tagline is now displayed */
  /* Dropdown behaviour on mobile: tapping the Capabilities link toggles the mega menu.
     On larger screens the menu appears on hover via CSS. */
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const menu = dropdownToggle.nextElementSibling;
        if (menu.style.display === 'block') {
          menu.style.display = 'none';
        } else {
          menu.style.display = 'block';
        }
      }
    });
  }



  /* Reveal animation for elements as they enter the viewport.  Elements with the
     `reveal` class will animate into view the first time they are scrolled into the
     viewport. */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* Roadmap auto‑scroll: when the user hovers over the right or left portion
     of the roadmap container, scroll the hidden content accordingly.  We avoid
     showing a native scrollbar and instead smoothly adjust scrollLeft.
     The scroll triggers only near the edges (30% from each side) for
     finer control. */
  const roadmap = document.querySelector('.roadmap');
  if (roadmap) {
    roadmap.addEventListener('mousemove', (e) => {
      const rect = roadmap.getBoundingClientRect();
      const maxScroll = roadmap.scrollWidth - roadmap.clientWidth;
      if (maxScroll <= 0) return;
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      let scrollRatio;
      if (ratio < 0.3) {
        // Hover near the left edge: scroll towards the beginning
        scrollRatio = 0;
      } else if (ratio > 0.7) {
        // Hover near the right edge: scroll towards the end
        scrollRatio = 1;
      } else {
        // Intermediate zone: map ratio from [0.3,0.7] to [0,1]
        scrollRatio = (ratio - 0.3) / 0.4;
      }
      roadmap.scrollLeft = scrollRatio * maxScroll;
    });
  }
  /* --------------------------------------
   * Additional scripts migrated from index.html
   *
   * The following sections implement behaviour that
   * was previously defined inline in the HTML. They
   * update dynamic content such as the current year,
   * position visual nodes in the hero network, generate
   * the scrolling ticker, and manage the progress
   * indicator for the AI adoption roadmap on smaller
   * screens.
   * -------------------------------------- */

  // Set the current year in the footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Position satellite nodes around the central node in the network hub
  function positionNodes() {
    const container = document.querySelector('#agent-network-hub .network-container');
    const nodes = document.querySelectorAll('#agent-network-hub .satellite-node');
    if (!container || nodes.length === 0) return;
    // Use 75% of the container's radius to leave space between nodes
    const radius = (container.offsetWidth / 2) * 0.75;
    nodes.forEach(node => {
      const angleDeg = parseFloat(node.getAttribute('data-angle'));
      if (Number.isNaN(angleDeg)) return;
      // Convert degrees to radians; subtract 90° so 0° starts at the top
      const angle = (angleDeg - 90) * Math.PI / 180;
      const rect = node.getBoundingClientRect();
      const nodeWidth = rect.width;
      const nodeHeight = rect.height;
      const x = container.clientWidth / 2 + radius * Math.cos(angle) - nodeWidth / 2;
      const y = container.clientHeight / 2 + radius * Math.sin(angle) - nodeHeight / 2;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
    });
  }
  positionNodes();
  window.addEventListener('resize', positionNodes);

  // Generate ticker content with randomized phrases and styles
  function initTicker() {
    const wrapper = document.getElementById('eleoro-ticker-unique');
    if (!wrapper) return;
    wrapper.innerHTML = '';
    const phrases = ['Agent Builder','Zapier', 'n8n', 'Make', 'Workato','OpenAI GPT', 'Anthropic Claude', 'Google Gemini', 'Meta LLaMA'];
    const styleClasses = [
      'eleoro-style-heavy',
      'eleoro-style-semi',
      'eleoro-style-italic',
      'eleoro-style-wide'
    ];
    // Durstenfeld shuffle
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    // Repeat the sequence twice for continuous scroll
    for (let rep = 0; rep < 2; rep++) {
      const shuffled = shuffle([...phrases]);
      shuffled.forEach((text, idx) => {
        const span = document.createElement('span');
        span.classList.add('eleoro-ticker-item');
        span.classList.add(styleClasses[idx % styleClasses.length]);
        span.textContent = text;
        wrapper.appendChild(span);
      });
    }
  }
  initTicker();

  // Roadmap progress indicator for smaller screens
  const roadmapContainer = document.querySelector('.from-ai-to-adoption .roadmap');
  const progressIndicator = document.querySelector('.from-ai-to-adoption .progress-indicator');
  const progressDots = document.querySelectorAll('.from-ai-to-adoption .progress-dot');
  const steps = roadmapContainer ? roadmapContainer.querySelectorAll('.step') : [];
  if (roadmapContainer && progressIndicator && progressDots.length === steps.length) {
    // Show or hide the progress indicator based on viewport width
    function toggleIndicator() {
      if (window.innerWidth <= 900) {
        progressIndicator.style.display = 'flex';
      } else {
        progressIndicator.style.display = 'none';
      }
    }
    toggleIndicator();
    window.addEventListener('resize', toggleIndicator);

    // Update which dot is active based on scroll or element visibility
    function updateProgress() {
      if (window.innerWidth > 900) {
        // Horizontal layout: compute index from scroll position
        const maxScroll = roadmapContainer.scrollWidth - roadmapContainer.clientWidth;
        if (maxScroll <= 0) return;
        const ratio = roadmapContainer.scrollLeft / maxScroll;
        const index = Math.round(ratio * (steps.length - 1));
        progressDots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      } else {
        // Vertical layout: determine which step is nearest to the top portion of viewport
        let activeIndex = 0;
        steps.forEach((step, idx) => {
          const rect = step.getBoundingClientRect();
          const threshold = window.innerHeight * 0.4;
          if (rect.top <= threshold) {
            activeIndex = idx;
          }
        });
        progressDots.forEach((dot, i) => {
          dot.classList.toggle('active', i === activeIndex);
        });
      }
    }
    roadmapContainer.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }
  
  /* FAQ toggle functionality
   * Expand or collapse FAQ answers when a question is clicked.
   * The plus/minus icon updates accordingly. */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-toggle-icon');
    if (question && answer && icon) {
      question.addEventListener('click', () => {
        const isOpen = answer.style.display === 'block';
        if (isOpen) {
          answer.style.display = 'none';
          icon.textContent = '+';
        } else {
          answer.style.display = 'block';
          icon.textContent = '−';
        }
      });
    }
  });
});


