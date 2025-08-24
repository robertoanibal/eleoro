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
});