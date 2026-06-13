/* ===================================================
   COCO Digital Agency — main.js (v2 with Parallax)
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. NAVBAR SCROLL ─────────────────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Tutup menu jika klik di luar
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    }
  });

  // Scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('mainNavbar').classList.toggle('scrolled', window.scrollY > 10);
  });

  /* ── 2. ACTIVE NAV LINK ON SCROLL ────────────── */
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...navLinks]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const setActive = () => {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    let current = null;
    sections.forEach(sec => { if (sec.offsetTop <= scrollMid) current = sec; });
    navLinks.forEach(a => {
      a.classList.toggle('active',
        current && a.getAttribute('href') === '#' + current.id
      );
    });
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ── 3. BUBBLE GENERATOR ──────────────────────── */
  const heroSection = document.querySelector('.hero-section, .hero-section-services');

  function createBubble() {
    if (!heroSection) return;
    const b = document.createElement('div');
    b.classList.add('bubble');
    const size  = Math.random() * 80 + 20;
    const x     = Math.random() * 95;
    const dur   = Math.random() * 10 + 10;
    const delay = Math.random() * 12;
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}%; bottom:-${size + 20}px;
      animation-duration:${dur}s;
      animation-delay:-${delay}s;
    `;
    heroSection.appendChild(b);
    setTimeout(() => b.remove(), (dur + delay) * 1000);
  }

  if (heroSection) {
    // Staggered reveal untuk cards
    document.querySelectorAll('.card').forEach((card, i) => {
      card.classList.add('reveal', `reveal-delay-${(i % 4) + 1}`);
    });

    for (let i = 0; i < 18; i++) createBubble();
    setInterval(createBubble, 1200);
  }

  /* ── 4. SCROLL REVEAL (IntersectionObserver) ─── */
  const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'];
  const revealEls = document.querySelectorAll(revealClasses.join(','));

  const revealObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        revealObserver.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── 5. TICKER DUPLICATE ──────────────────────── */
  const track = document.querySelector('.ticker-track');
  if (track) track.innerHTML += track.innerHTML;

  /* ── 6. HERO PARALLAX BERLAPIS ────────────────── */
  /*
    Layer system (kecepatan scroll dikali faktor):
      bg        → 0.15  (paling lambat, paling jauh)
      bunga     → 0.25
      balon     → 0.30
      pesawat   → 0.08  (drift gentle)
      teks hero → 0.05  (hampir fixed)
  */

  const parallaxBg       = document.querySelector('.hero-bg, .hero-bg-services');
  const flowers          = document.querySelectorAll('.flower');
  const balloons         = document.querySelectorAll('.balloon');
  const planes           = document.querySelectorAll('.plane');
  const heroContent      = document.querySelector('.hero-content, .hero-content-services');
  const trees            = document.querySelectorAll('.tree');
  const warePlanes       = document.querySelectorAll('.weare-plane');
  const decorServices    = document.querySelectorAll(
    '.panah-services, .tangan-services, .loading-services, .file-services, .move-services, .timer-services, .tangan2-services'
  );

  // Simpan transform awal agar bisa digabung dgn animasi CSS
  // Kita gunakan CSS custom property per-elemen
  const setParallax = (el, yPx) => {
    if (!el) return;
    el.style.setProperty('--px-offset', `${yPx}px`);
    // Gabungkan dengan animation matrix via translateY di wrapper
    // Gunakan margin-top trick supaya tidak menimpa CSS animation transform
    el.style.marginTop = `${yPx}px`;
  };

  // Gunakan requestAnimationFrame untuk parallax smooth
  let ticking = false;

  const onParallaxScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;

        // Background — batasi agar tidak terus bergeser
        if (parallaxBg) {
          const bgSection = parallaxBg.closest('section');
          const bgBottom  = bgSection ? bgSection.offsetTop + bgSection.offsetHeight : 800;
          if (y < bgBottom) {
            parallaxBg.style.transform = `translateY(${y * 0.18}px)`;
          }
        }

        // Bunga — pakai transform bukan marginTop
        flowers.forEach((el) => {
          const factor = parseFloat(el.dataset.parallax || 0.22);
          const section = el.closest('section');
          const sectionBottom = section ? section.offsetTop + section.offsetHeight : 800;
          if (y < sectionBottom) {
            el.style.transform = `rotate(-3deg) translateY(${-y * factor}px)`;  // gabung dengan sway
          }
        });

        // Trees (services page)
        trees.forEach((el, i) => {
          const factor = 0.2 + (i * 0.05);
          el.style.marginTop = `${-y * factor}px`;
        });

        // Balon
        balloons.forEach((el, i) => {
          const factor = 0.30 + (i * 0.06);
          const section = el.closest('section');
          const sectionBottom = section ? section.offsetTop + section.offsetHeight : 800;
          if (y < sectionBottom) {
            el.style.transform = `translateY(${-y * factor}px)`;
          }
        });

        // Pesawat — drift diagonal
        planes.forEach((el, i) => {
          const xFactor = i % 2 === 0 ? 0.06 : -0.06;
          el.style.marginTop   = `${-y * 0.12}px`;
          // Jangan override transform dari CSS animation, hanya translateX kecil
        });

        // Hero text — gerak paling lambat (parallax text fade)
        if (heroContent) {
          const heroBottom = heroContent.closest('section')?.offsetHeight || 600;
  
          if (y < heroBottom) {
            const opacity = Math.max(0, 1 - y / 500);
            heroContent.style.opacity   = opacity;
            heroContent.style.transform = `translateY(${-y * 0.05}px)`;  // ← pakai transform
          } else {
            // Reset saat sudah keluar hero
            heroContent.style.opacity   = '';
            heroContent.style.transform = '';
          }
        }

        // Weare section planes
        warePlanes.forEach((el, i) => {
          const factor = 0.1 + i * 0.05;
          el.style.marginTop = `${-y * factor}px`;
        });

        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onParallaxScroll, { passive: true });

  /* ── 7. SMOOTH PLANE DRIFT ON SCROLL (tambahan) ─ */
  // Pesawat mendrift ke kanan/kiri saat scroll — efek terbang
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const planeR = document.querySelector('.plane-right');
    const planeL = document.querySelector('.plane-left');
    if (planeR) planeR.style.transform = `translate(${y * 0.09}px, ${-y * 0.12}px) rotate(-6deg)`;
    if (planeL) planeL.style.transform = `scaleX(-1) translate(${y * 0.07}px, ${y * 0.08}px) rotate(4deg)`;
  }, { passive: true });

  /* ── 8. WEARE PLANES ENTRANCE ANIMATION ──────── */
  const warePlaneLeft  = document.querySelector('.weare-plane-left');
  const warePlaneRight = document.querySelector('.weare-plane-right');

  if (warePlaneLeft || warePlaneRight) {
    const planeObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (warePlaneLeft)  {
            warePlaneLeft.style.transition  = 'left 1.2s cubic-bezier(0.22,1,0.36,1)';
            warePlaneLeft.style.left        = '0';
          }
          if (warePlaneRight) {
            warePlaneRight.style.transition = 'right 1.2s cubic-bezier(0.22,1,0.36,1)';
            warePlaneRight.style.right      = '0';
          }
          planeObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });

    const tornBottom = document.querySelector('.torn-bottom');
    if (tornBottom) planeObserver.observe(tornBottom);
  }

  /* ── 9. CARD STAGGER ANIMATION ───────────────── */
  const cardWrappers = document.querySelectorAll('.cards-wrapper');
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.card');
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, i * 120);
        });
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cardWrappers.forEach(wrapper => {
    const cards = wrapper.querySelectorAll('.card');
    cards.forEach(card => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)';
    });
    cardObserver.observe(wrapper);
  });

  /* ── 10. CLIENT LOGO STAGGER ─────────────────── */
  const clientsGrid = document.querySelector('.clients-grid');
  if (clientsGrid) {
    const logos = clientsGrid.querySelectorAll('img');
    logos.forEach((logo, i) => {
      logo.style.opacity   = '0';
      logo.style.transform = 'translateY(20px) scale(0.9)';
      logo.style.transition = `opacity 0.5s ease ${i * 60}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms`;
    });

    const logoObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          logos.forEach(logo => {
            logo.style.opacity   = '1';
            logo.style.transform = 'translateY(0) scale(1)';
          });
          logoObserver.disconnect();
        }
      });
    }, { threshold: 0.1 });

    logoObserver.observe(clientsGrid);
  }

  /* ── 11. BELIEF CARD STAGGER ─────────────────── */
  const beliefRows = document.querySelectorAll('.belief-row');
  beliefRows.forEach(row => {
    const beliefCards = row.querySelectorAll('.belief-card');
    beliefCards.forEach((card, i) => {
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(30px) scale(0.95)';
      card.style.transition = `opacity 0.7s ease ${i * 100}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`;
    });

    const beliefObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          beliefCards.forEach(card => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
          beliefObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    beliefObserver.observe(row);
  });

  /* ── 12. DECORATIVE SERVICES ASSETS ENTRANCE ─── */
  const serviceDecos = document.querySelectorAll(
    '.panah-services, .tangan-services, .loading-services, ' +
    '.file-services, .move-services, .timer-services, .tangan2-services'
  );

  serviceDecos.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'scale(0.8)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
  });

  const decoObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'scale(1)';
        decoObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });

  serviceDecos.forEach(el => decoObserver.observe(el));

  /* ── 13. SEND BUTTON RIPPLE ──────────────────── */
  const btnSend = document.querySelector('.btn-send');
  if (btnSend) {
    btnSend.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect   = btnSend.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        background:rgba(255,255,255,0.35);
        transform:scale(0); animation:rippleEffect 0.6s ease forwards;
        pointer-events:none;
      `;
      btnSend.style.position = 'relative';
      btnSend.style.overflow = 'hidden';
      btnSend.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }

  // Keyframe ripple di inject via JS
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleEffect {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

}); // END DOMContentLoaded


let xPos = 0;

gsap.timeline()
    .set(dragger, { opacity:0 }) //make the drag layer invisible
    .set(ring,    { rotationY:180 }) //set initial rotationY so the parallax jump happens off screen
    .set('.img',  { // apply transform rotations to each image
      rotateY: (i)=> i*-36,
      transformOrigin: '50% 50% 500px',
      z: -500,
      backgroundImage:(i)=>'url(https://picsum.photos/id/'+(i+32)+'/700/300/)',
      backgroundPosition:(i)=>getBgPos(i),
      backfaceVisibility:'hidden'
    })    
    .from('.img', {
      duration:1.5,
      y:200,
      opacity:0,
      stagger:0.1,
      ease:'expo'
    })

Draggable.create(dragger, {
  
  onDragStart:(e)=>{ 
    if (e.touches) e.clientX = e.touches[0].clientX;
    xPos = Math.round(e.clientX);
  },
  
  onDrag:(e)=>{
    if (e.touches) e.clientX = e.touches[0].clientX;    
    
    gsap.to(ring, {
      rotationY: '-=' +( (Math.round(e.clientX)-xPos)%360 ),
      onUpdate: ()=>{gsap.set('.img', { backgroundPosition:(i)=>getBgPos(i) }) }
    });
    
    xPos = Math.round(e.clientX);
  },
  
  onDragEnd:()=> {
    // gsap.to(ring, { rotationY: Math.round(gsap.getProperty(ring,'rotationY')/36)*36 }) // move to nearest photo...at the expense of the inertia effect
    gsap.set(dragger, {x:0, y:0}) // reset drag layer
  }
  
})


function getBgPos(i){ //returns the background-position string to create parallax movement in each image
  return ( -gsap.utils.wrap(0,360,gsap.getProperty(ring, 'rotationY')-180-i*36)/360*400 )+'px 0px';
}
