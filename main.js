/**
 * Godrex Capital — Institutional Forex Broker Interactive Engine
 * Adheres to Gysis Engineering Standards: zero-trust validation, sanitized inputs, and resilient state.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- 1. Mobile Navigation & Dropdown Management ---
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('nav-menu');
  const dropdownParent = document.querySelector('.dropdown-parent');
  const dropdownBtn = document.getElementById('dropdownBtn');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      // Morph burger bars
      const bars = mobileToggle.querySelectorAll('.bar');
      if (isOpen) {
        bars[0].style.transform = 'translateY(8.5px) rotate(45deg)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'translateY(-8.5px) rotate(-45deg)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    // Close mobile nav on link click
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          const bars = mobileToggle.querySelectorAll('.bar');
          bars[0].style.transform = 'none';
          bars[1].style.opacity = '1';
          bars[2].style.transform = 'none';
        }
      });
    });
  }

  // Toggle dropdown on mobile/touch
  if (dropdownBtn && dropdownParent) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = dropdownParent.classList.toggle('open');
      dropdownBtn.setAttribute('aria-expanded', String(isExpanded));
    });

    document.addEventListener('click', (e) => {
      if (!dropdownParent.contains(e.target)) {
        dropdownParent.classList.remove('open');
        dropdownBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- 2. Interactive Forex Profit & Pip Calculator ---
  const pairButtons = document.querySelectorAll('#pairSelector .strat-btn');
  const leverageButtons = document.querySelectorAll('#leverageSelector .strat-btn');
  const lotSlider = document.getElementById('lotSlider');
  const pipSlider = document.getElementById('pipSlider');

  const lotValDisplay = document.getElementById('lotValDisplay');
  const pipValDisplay = document.getElementById('pipValDisplay');
  const pipValueBadge = document.getElementById('pipValueBadge');
  const tradeProfitDisplay = document.getElementById('tradeProfitDisplay');
  const marginRequiredDisplay = document.getElementById('marginRequiredDisplay');

  const chartArea = document.getElementById('chartArea');
  const chartLine = document.getElementById('chartLine');
  const chartPoint = document.getElementById('chartPoint');

  // Initial Calculator State
  let currentPair = 'EURUSD';
  let basePipValue = 10.0; // $10 per lot for EUR/USD
  let currentPrice = 1.0850;
  let currentLeverage = 500;

  const formatUSD = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const updateForexCalculator = () => {
    if (!lotSlider || !pipSlider) return;

    const lots = parseFloat(lotSlider.value) || 1.0;
    const pips = parseInt(pipSlider.value, 10) || 35;

    // Display inputs
    lotValDisplay.textContent = `${lots.toFixed(2)} ${lots === 1 ? 'Lot' : 'Lots'}`;
    pipValDisplay.textContent = `+${pips} Pips`;

    // Calculate Pip Value for current lot size
    const effectivePipValue = basePipValue * lots;
    if (pipValueBadge) {
      pipValueBadge.textContent = `Pip Value: ${formatUSD(effectivePipValue)} / pip`;
    }

    // Projected Profit = Pips * Effective Pip Value
    const totalProfit = pips * effectivePipValue;
    if (tradeProfitDisplay) {
      tradeProfitDisplay.textContent = `+${formatUSD(totalProfit)}`;
    }

    // Required Margin: (ContractSize * Lots * Price) / Leverage
    // Standard contract size: 100,000 for FX, 100 oz for Gold (XAUUSD)
    const contractSize = currentPair === 'XAUUSD' ? 100 : 100000;
    const marginRequired = (contractSize * lots * currentPrice) / currentLeverage;
    if (marginRequiredDisplay) {
      marginRequiredDisplay.textContent = formatUSD(marginRequired);
    }

    // Dynamic SVG Curve Update
    if (chartArea && chartLine && chartPoint) {
      // Scale curve height based on profit (from $50 to $20,000+)
      const normalizedFactor = Math.min(Math.max(totalProfit / 3500, 0.12), 1.0);
      const endY = Math.round(135 - normalizedFactor * 105);
      const midY = Math.round(140 - normalizedFactor * 50);

      const lineD = `M0,135 Q180,${midY} 400,${endY}`;
      const areaD = `M0,150 L0,135 Q180,${midY} 400,${endY} L400,150 Z`;

      chartLine.setAttribute('d', lineD);
      chartArea.setAttribute('d', areaD);
      chartPoint.setAttribute('cy', String(endY));
    }
  };

  // Pair selector events
  if (pairButtons.length > 0) {
    pairButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        pairButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPair = btn.dataset.pair || 'EURUSD';
        basePipValue = parseFloat(btn.dataset.pipvalue) || 10.0;
        currentPrice = parseFloat(btn.dataset.price) || 1.0850;
        updateForexCalculator();
      });
    });
  }

  // Leverage selector events
  if (leverageButtons.length > 0) {
    leverageButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        leverageButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLeverage = parseInt(btn.dataset.leverage, 10) || 500;
        updateForexCalculator();
      });
    });
  }

  if (lotSlider && pipSlider) {
    lotSlider.addEventListener('input', updateForexCalculator);
    pipSlider.addEventListener('input', updateForexCalculator);
    updateForexCalculator(); // Initialize on load
  }

  // --- 3. Interactive Account Type Cards ---
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('active-service'));
      card.classList.add('active-service');
      // If user clicked card CTA, pre-select that account in the modal
      const serviceType = card.dataset.service;
      const accountSelect = document.getElementById('accountType');
      if (accountSelect && serviceType) {
        accountSelect.value = serviceType;
      }
    });
  });

  // --- 4. FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close other items
        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });
        // Toggle clicked
        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // --- 5. CTA Buttons Management ---
  // Dead CTA buttons: click with visual feedback but take no action
  ['heroCtaBtn', 'demoCtaBtn', 'calcCtaBtn', 'footerCtaBtn', 'openModalBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }
  });

  // --- 6. Form Handling with OWASP Zero-Trust Validation ---
  const sanitizeString = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return emailRegex.test(email);
  };

  // Market Signals Newsletter Form
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterEmail = document.getElementById('newsletterEmail');
  const newsletterFeedback = document.getElementById('newsletterFeedback');

  if (newsletterForm && newsletterEmail && newsletterFeedback) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = sanitizeString(newsletterEmail.value.trim());

      if (!validateEmail(email)) {
        newsletterFeedback.className = 'form-feedback error';
        newsletterFeedback.textContent = 'Please enter a valid email address.';
        return;
      }

      newsletterFeedback.className = 'form-feedback success';
      newsletterFeedback.textContent = 'Subscribed to daily FX market setups & institutional COT signals.';
      newsletterForm.reset();

      setTimeout(() => {
        newsletterFeedback.className = 'form-feedback';
        newsletterFeedback.textContent = '';
      }, 5000);
    });
  }

  // --- 7. Active Nav Link on Scroll ---
  const sections = document.querySelectorAll('header[id], section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // Micro-animation for bento deck hover tilt
  const deckCards = document.querySelectorAll('.deck-card');
  deckCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
});
