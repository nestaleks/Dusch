// Slider and minor enhancements
(function () {
  // Current year in footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var slider = document.querySelector('.slider');
  if (!slider) return;

  var track = slider.querySelector('.slider__track');
  var slides = Array.from(slider.querySelectorAll('.slide'));
  var prevBtn = slider.querySelector('.slider__btn.prev');
  var nextBtn = slider.querySelector('.slider__btn.next');
  var dotsEl = slider.querySelector('.slider__dots');
  var autoplay = slider.getAttribute('data-autoplay') === 'true';
  var interval = parseInt(slider.getAttribute('data-interval') || '5000', 10);
  var index = 0; // position index (starts at first visible slide)
  var timer = null;
  var perView = 1; // slides per view (responsive)
  var maxIndex = 0; // maximum starting index given perView

  function getPerView() {
    var w = window.innerWidth || document.documentElement.clientWidth;
    // Always show 3/2/1 slides across breakpoints (desktop/tablet/mobile)
    if (w >= 1024) return 3;
    if (w >= 600) return 2;
    return 1;
  }

  function layoutSlides() {
    perView = getPerView();
    // CSS полностью контролирует размеры через media queries
    maxIndex = Math.max(0, slides.length - perView);
  }

  function go(i) {
    // normalize index within [0, maxIndex] with wrap-around
    if (maxIndex < 0) maxIndex = 0;
    if (i < 0) {
      index = maxIndex; // wrap to last position
    } else if (i > maxIndex) {
      index = 0; // wrap to beginning
    } else {
      index = i;
    }
    
    // Простое смещение: каждый слайд занимает (width + margin)
    if (slides.length > 0) {
      var slideWidth = slides[0].offsetWidth;
      var marginRight = parseFloat(getComputedStyle(slides[0]).marginRight) || 0;
      var offset = -index * (slideWidth + marginRight);
      track.style.transform = 'translateX(' + offset + 'px)';
    }
    updateDots();
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  function updateDots() {
    var buttons = dotsEl.querySelectorAll('button');
    buttons.forEach(function (b, i) { b.setAttribute('aria-selected', i === index ? 'true' : 'false'); });
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    // One dot per possible starting position
    for (var i = 0; i <= maxIndex; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      var startIdx = i + 1;
      var endIdx = Math.min(i + perView, slides.length);
      var label = perView > 1 ? ('Bewertungen ' + startIdx + '–' + endIdx) : ('Bewertung ' + startIdx);
      b.setAttribute('aria-label', label);
      (function (pos) {
        b.addEventListener('click', function () { go(pos); stop(); start(); });
      })(i);
      dotsEl.appendChild(b);
    }
    updateDots();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); stop(); start(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); stop(); start(); });

  // Keyboard navigation
  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { prev(); stop(); start(); }
    if (e.key === 'ArrowRight') { next(); stop(); start(); }
  });

  function start() {
    if (!autoplay) return;
    stop();
    timer = setInterval(next, interval);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  // Pause on hover/focus
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  // Pause when tab not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  // Handle responsive changes
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var prevPerView = perView;
      layoutSlides();
      if (index > maxIndex) index = maxIndex;
      buildDots();
      go(index);
    }, 150);
  });

  // Init
  layoutSlides();
  buildDots();
  go(0);
  start();
})();

// Mobile Menu Functionality
(function () {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-menu__close');
  const mobileBackdrop = document.querySelector('.mobile-menu__backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');
  const body = document.body;

  if (!mobileToggle || !mobileMenu) return;

  // State tracking
  let isOpen = false;

  // Open menu
  function openMenu() {
    isOpen = true;
    mobileToggle.classList.add('active');
    mobileMenu.classList.add('active');
    body.classList.add('mobile-menu-open');
    
    // Update ARIA attributes
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileToggle.setAttribute('aria-label', 'Menü schließen');
    mobileMenu.setAttribute('aria-hidden', 'false');
    
    // Focus management - move focus to close button
    setTimeout(() => {
      if (mobileClose) mobileClose.focus();
    }, 300);
  }

  // Close menu
  function closeMenu() {
    isOpen = false;
    mobileToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    body.classList.remove('mobile-menu-open');
    
    // Update ARIA attributes
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', 'Menü öffnen');
    mobileMenu.setAttribute('aria-hidden', 'true');
    
    // Return focus to toggle button
    mobileToggle.focus();
  }

  // Toggle menu
  function toggleMenu() {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Event listeners
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMenu);
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMenu);
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMenu);
  }

  // Close menu when clicking on links
  mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // For anchor links (internal navigation), close the menu
      if (link.getAttribute('href').startsWith('#')) {
        closeMenu();
        
        // Smooth scroll to target
        const target = link.getAttribute('href');
        const targetElement = document.querySelector(target);
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 300);
        }
      }
      // For external links (like impressum.html), let default behavior happen
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });

  // Close menu on window resize if mobile breakpoint is exceeded
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isOpen) {
      closeMenu();
    }
  });

  // Focus trap within mobile menu when open
  document.addEventListener('keydown', (e) => {
    if (!isOpen || e.key !== 'Tab') return;

    const focusableElements = mobileMenu.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });

  // Handle page load state
  if (mobileMenu.classList.contains('active')) {
    closeMenu();
  }
})();

// FAQ Accordion functionality
(function () {
  var faqQuestions = document.querySelectorAll('.faq-question');
  
  if (!faqQuestions.length) return;
  
  faqQuestions.forEach(function(question) {
    question.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      var answerId = this.getAttribute('aria-controls');
      var answer = document.getElementById(answerId);
      
      if (!answer) return;
      
      // Close all other FAQ items
      faqQuestions.forEach(function(otherQuestion) {
        if (otherQuestion !== question) {
          var otherAnswerId = otherQuestion.getAttribute('aria-controls');
          var otherAnswer = document.getElementById(otherAnswerId);
          
          otherQuestion.setAttribute('aria-expanded', 'false');
          if (otherAnswer) {
            otherAnswer.setAttribute('aria-hidden', 'true');
          }
        }
      });
      
      // Toggle current FAQ item
      if (expanded) {
        // Close current
        this.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
      } else {
        // Open current
        this.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });
    
    // Handle keyboard navigation
    question.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
})();

// Scroll Animation - плавное появление элементов при прокрутке
(function () {
  // Проверка поддержки Intersection Observer
  if (!('IntersectionObserver' in window)) {
    // Fallback: просто показываем все элементы
    var hiddenElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .fade-in-up');
    hiddenElements.forEach(function(el) {
      el.classList.add('visible');
    });
    return;
  }

  // Настройки анимации
  var animationOptions = {
    threshold: 0.1, // Элемент должен быть виден на 10%
    rootMargin: '0px 0px -50px 0px' // Анимация начинается за 50px до появления элемента
  };

  // Создаем наблюдатель
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Отключаем наблюдение после появления (оптимизация)
        observer.unobserve(entry.target);
      }
    });
  }, animationOptions);

  // Находим все элементы с классами анимации
  var animatedElements = document.querySelectorAll(
    '.fade-in, .slide-in-left, .slide-in-right, .fade-in-up, .fade-in-delay'
  );

  // Начинаем наблюдение за элементами
  animatedElements.forEach(function(el) {
    observer.observe(el);
  });

  // Для секций добавляем класс автоматически
  var sections = document.querySelectorAll('.section:not(.hero)');
  sections.forEach(function(section) {
    observer.observe(section);
  });

  // Анимация для элементов внутри секций
  var innerElements = document.querySelectorAll(
    '.card, .features-flow, .features-images img, .video-wrapper, .slider, .faq-item'
  );
  innerElements.forEach(function(el) {
    observer.observe(el);
  });
})();