/* ==========================================================================
   HRIDEY DUTTA — 2026 VIDEO EDITOR & MOTION DESIGNER PORTFOLIO
   JavaScript Engine: Multi-Page Routing, Mobile Drawer, Parallax & Modal Player
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Highlight Active Navigation Item Based on Current Page URL
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-menu a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 2. Mobile Navigation Drawer Controller
  const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-menu a');

  function openMobileMenu() {
    if (!mobileNavOverlay) return;
    mobileNavOverlay.classList.add('active');
    document.body.classList.add('mobile-menu-open');
  }

  function closeMobileMenu() {
    if (!mobileNavOverlay) return;
    mobileNavOverlay.classList.remove('active');
    document.body.classList.remove('mobile-menu-open');
  }

  if (mobileMenuTrigger) {
    mobileMenuTrigger.addEventListener('click', openMobileMenu);
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileMenu);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNavOverlay && mobileNavOverlay.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // 3. Mouse Position & Parallax State (Home Hero)
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  const heroPortrait = document.querySelector('.hero-portrait-container');
  const titleLine1 = document.querySelector('.hero-title-line.line-1');
  const titleLine2 = document.querySelector('.hero-title-line.line-2');
  const yearBadge = document.querySelector('.hero-year-badge');
  const bgGrid = document.querySelector('.bg-grid');
  const symbols = document.querySelectorAll('.hero-symbol');

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  const lerp = (start, end, factor) => start + (end - start) * factor;

  function animateParallax() {
    target.x = lerp(target.x, mouse.x, 0.06);
    target.y = lerp(target.y, mouse.y, 0.06);

    const relX = (target.x - window.innerWidth / 2) / (window.innerWidth / 2);
    const relY = (target.y - window.innerHeight / 2) / (window.innerHeight / 2);

    if (bgGrid) {
      bgGrid.style.transform = `translate3d(${relX * 8}px, ${relY * 8}px, 0)`;
    }

    if (heroPortrait) {
      heroPortrait.style.transform = `translate3d(${relX * -20}px, calc(-50% + ${relY * -16}px), 0) rotate(${relX * 1.2}deg)`;
    }

    if (titleLine1) {
      titleLine1.style.transform = `translate3d(${relX * 14}px, ${relY * 10}px, 0)`;
    }

    if (titleLine2) {
      titleLine2.style.transform = `translate3d(${relX * -12}px, ${relY * -8}px, 0)`;
    }

    if (yearBadge) {
      yearBadge.style.transform = `translate3d(${relX * 8}px, ${relY * 12}px, 0)`;
    }

    symbols.forEach((symbol, index) => {
      const speed = (index + 1) * 10;
      symbol.style.transform = `translate3d(${relX * speed}px, ${relY * speed}px, 0)`;
    });

    requestAnimationFrame(animateParallax);
  }

  if (heroPortrait || titleLine1) {
    animateParallax();
  }

  // 4. Custom Cursor Engine (Desktop Only)
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');
  const cursorBadge = follower ? follower.querySelector('.cursor-badge') : null;

  let cursorTarget = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let cursorCurrent = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  window.addEventListener('mousemove', (e) => {
    cursorTarget.x = e.clientX;
    cursorTarget.y = e.clientY;

    if (cursor) {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }
  });

  function animateCursor() {
    cursorCurrent.x = lerp(cursorCurrent.x, cursorTarget.x, 0.18);
    cursorCurrent.y = lerp(cursorCurrent.y, cursorTarget.y, 0.18);

    if (follower) {
      follower.style.left = `${cursorCurrent.x}px`;
      follower.style.top = `${cursorCurrent.y}px`;
    }

    requestAnimationFrame(animateCursor);
  }

  if (matchMedia('(pointer: fine)').matches) {
    animateCursor();

    document.querySelectorAll('.project-card, .showreel-wrapper, .modal-video-box').forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover-video');
        if (cursorBadge) cursorBadge.textContent = 'PLAY';
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover-video');
      });
    });

    document.querySelectorAll('a, button, .filter-btn, .campaign-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover-link');
        if (cursorBadge) cursorBadge.textContent = el.getAttribute('data-cursor') || 'VIEW';
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover-link');
      });
    });
  }

  // 5. Intersection Observer for Autoplay/Pause Videos
  const videoElements = document.querySelectorAll('video:not(.modal-video)');
  const videoObserverOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, videoObserverOptions);

  videoElements.forEach(video => {
    videoObserver.observe(video);
  });

  // 6. Project Filtering System (Work Page)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // 7. Fullscreen Video Detail Modal Controller
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalYear = document.getElementById('modal-year');
  const modalDesc = document.getElementById('modal-desc');
  const modalTagsContainer = document.getElementById('modal-tags');
  const modalCloseBtn = document.getElementById('modal-close');

  function openModal(cardData) {
    if (!modal) return;

    modalVideo.src = cardData.videoSrc;
    modalTitle.textContent = cardData.title;
    modalCategory.textContent = cardData.category;
    modalYear.textContent = cardData.year;
    modalDesc.textContent = cardData.description;

    modalTagsContainer.innerHTML = '';
    if (cardData.techStack) {
      const tags = cardData.techStack.split(',');
      tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tech-tag';
        span.textContent = tag.trim();
        modalTagsContainer.appendChild(span);
      });
    }

    modal.classList.add('active');
    modalVideo.play().catch(() => {});
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modalVideo.pause();
    modalVideo.src = '';
  }

  const allModalCards = document.querySelectorAll('.project-card, .open-modal-card');

  allModalCards.forEach(card => {
    card.addEventListener('click', () => {
      const data = {
        videoSrc: card.getAttribute('data-video') || 'videos/showreel_main.mp4',
        title: card.getAttribute('data-title') || 'VIDEO EDITING SHOWCASE',
        category: card.getAttribute('data-category-label') || 'MOTION GRAPHICS',
        year: card.getAttribute('data-year') || '2026',
        description: card.getAttribute('data-desc') || 'High-impact commercial video edit.',
        techStack: card.getAttribute('data-tech') || 'After Effects, Premiere Pro'
      };
      openModal(data);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // 8. Showreel Mute/Unmute Audio Toggle
  const mainShowreel = document.getElementById('main-showreel-video');
  const audioToggle = document.getElementById('audio-toggle');

  if (audioToggle && mainShowreel) {
    audioToggle.addEventListener('click', () => {
      mainShowreel.muted = !mainShowreel.muted;
      audioToggle.innerHTML = mainShowreel.muted ? 
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>` :
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    });
  }

  // 9. Interactive Behance Appreciate & Follow Controllers
  let isAppreciated = false;
  let appreciationCount = 691;
  const appreciationCountEl = document.getElementById('appreciation-count');
  const appreciateBtns = document.querySelectorAll('.appreciate-toggle-btn');

  appreciateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      isAppreciated = !isAppreciated;

      if (isAppreciated) {
        appreciationCount++;
        btn.style.backgroundColor = '#003eb3';
      } else {
        appreciationCount--;
        btn.style.backgroundColor = '#0057ff';
      }

      if (appreciationCountEl) {
        appreciationCountEl.textContent = appreciationCount;
      }
    });
  });

  const followBtns = document.querySelectorAll('.follow-toggle-btn');
  followBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const followText = btn.querySelector('.follow-text');
      if (!followText) return;

      if (followText.textContent === 'Follow') {
        followText.textContent = 'Following';
        btn.style.backgroundColor = '#16a34a';
      } else {
        followText.textContent = 'Follow';
        btn.style.backgroundColor = '#0057ff';
      }
    });
  });

  // 10. Live Comment Posting Form Handler
  const liveCommentForm = document.getElementById('live-comment-form');
  const commentInput = document.getElementById('new-comment-input');
  const commentsListContainer = document.getElementById('comments-list-container');

  if (liveCommentForm && commentInput && commentsListContainer) {
    liveCommentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      const newCommentHTML = `
        <div class="comment-item" style="animation: fadeIn 0.4s ease;">
          <div class="comment-avatar" style="background: #0057ff;">YOU</div>
          <div class="comment-content">
            <div class="comment-header-row">
              <span class="comment-user-name">You</span>
              <span class="comment-date">• Just now</span>
            </div>
            <div class="comment-body">${text}</div>
          </div>
        </div>
      `;

      commentsListContainer.insertAdjacentHTML('afterbegin', newCommentHTML);
      commentInput.value = '';
    });
  }
});
