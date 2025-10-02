// Auto-refresh functionality for admin changes
let lastRefreshTime = 0;
const REFRESH_INTERVAL = 5000; // Check every 5 seconds

function checkForUpdates() {
  // Only check if we're on a page that displays blog content
  if (window.location.pathname.includes('/blog') || window.location.pathname === '/') {
    fetch('/api/blogs')
      .then(response => response.json())
      .then(data => {
        const currentTime = Date.now();
        if (lastRefreshTime === 0) {
          lastRefreshTime = currentTime;
          return;
        }
        
        // Check if any blog post has been updated recently
        const hasRecentUpdates = Object.values(data).some(post => {
          if (post.updatedAt) {
            const updateTime = new Date(post.updatedAt).getTime();
            return updateTime > lastRefreshTime;
          }
          return false;
        });
        
        if (hasRecentUpdates) {
          console.log('Blog updates detected, refreshing page...');
          lastRefreshTime = currentTime;
          // Soft refresh - just reload the content without full page reload
          if (window.location.pathname.includes('/blog')) {
            window.location.reload();
          } else {
            // For home page, just reload
            window.location.reload();
          }
        }
      })
      .catch(error => {
        console.log('Error checking for updates:', error);
      });
  }
}

// Start checking for updates
setInterval(checkForUpdates, REFRESH_INTERVAL);

// Page transition animations and interactive effects
document.addEventListener('DOMContentLoaded', () => {
  // Initialize slideshow on home page
  initSlideshow();
  // Create page transition overlay
  const createTransitionOverlay = () => {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);
    return overlay;
  };

  // Get pan direction based on navigation
  const getPanDirection = (fromPage, toPage) => {
    const pageOrder = ['home', 'about', 'activities', 'team', 'partners', 'blog', 'events', 'volunteer', 'donate'];
    const fromIndex = pageOrder.indexOf(fromPage);
    const toIndex = pageOrder.indexOf(toPage);
    
    if (fromIndex === -1 || toIndex === -1) return 'pan-right';
    
    // Vertical panning cases
    if (toPage === 'donate' && fromPage !== 'volunteer') return 'pan-up';
    if (fromPage === 'donate' && toPage !== 'volunteer') return 'pan-down';
    if (toPage === 'volunteer' && fromPage === 'donate') return 'pan-down';
    if (fromPage === 'volunteer' && toPage === 'donate') return 'pan-up';
    
    // Home page pan up from any other page
    if (toPage === 'home' && fromPage !== 'home') return 'pan-up';
    
    // Additional vertical panning for specific page combinations
    if (toPage === 'events' && (fromPage === 'blog' || fromPage === 'partners')) return 'pan-up';
    if (fromPage === 'events' && (toPage === 'blog' || toPage === 'partners')) return 'pan-down';
    if (toPage === 'team' && (fromPage === 'activities' || fromPage === 'about')) return 'pan-up';
    if (fromPage === 'team' && (toPage === 'activities' || toPage === 'about')) return 'pan-down';
    if (toPage === 'blog' && fromPage === 'partners') return 'pan-up';
    if (fromPage === 'blog' && toPage === 'partners') return 'pan-down';
    if (toPage === 'activities' && fromPage === 'about') return 'pan-up';
    if (fromPage === 'activities' && toPage === 'about') return 'pan-down';
    
    // Horizontal panning for main navigation
    if (toIndex > fromIndex) return 'pan-left';
    if (toIndex < fromIndex) return 'pan-right';
    return 'pan-right';
  };


  // Add page transition effects with pan animations
  const links = document.querySelectorAll('a[href^="/"], a[href^="./"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const href = this.getAttribute('href');
      const currentPage = window.location.pathname.split('/').pop() || 'home';
      const targetPage = href.split('/').pop() || 'home';
      
      // Get pan direction
      const panDirection = getPanDirection(currentPage, targetPage);
      
      // Add page content animation
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.classList.add('page-content');
        mainContent.classList.add(`slide-out-${panDirection.replace('pan-', '')}`);
      }
      
      // Navigate after animation
      setTimeout(() => {
        window.location.href = href;
      }, 600);
    });
  });

  // Add entrance animations for elements
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe cards and sections for entrance animations
  const animatedElements = document.querySelectorAll('.card, .team-card, .hero, section');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.btn, .nav a');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
});

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 153, 0, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Slideshow functionality for home page
function initSlideshow() {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return; // Not on home page
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  
  function showSlide(index) {
    // Remove active class from all slides
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Add active class to current slide
    slides[index].classList.add('active');
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
  }
  
  // Start slideshow - change slide every 4 seconds
  setInterval(nextSlide, 4000);
  
  // Initialize first slide
  showSlide(0);
}
