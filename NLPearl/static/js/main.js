// Enhanced interactions and animations
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        // Add background blur effect
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Form validation and enhancement
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');

    if (searchForm && searchInput && searchButton) {
        // Add loading state to search button
        searchForm.addEventListener('submit', function(e) {
            if (searchInput.value.trim() === '') {
                e.preventDefault();
                showNotification('Please enter a topic or learning goal', 'error');
                return;
            }

            // Add loading state
            searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
            searchButton.disabled = true;
        });

        // Input validation
        searchInput.addEventListener('input', function() {
            const value = this.value.trim();
            if (value.length > 0) {
                searchButton.disabled = false;
                this.style.borderColor = 'var(--primary-color)';
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });

        // Auto-focus on search input
        if (window.location.pathname === '/recommend') {
            searchInput.focus();
        }
    }

    // Animate cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards and features
    document.querySelectorAll('.course-card, .feature-card, .step').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add hover effects to course cards
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Copy to clipboard functionality for course URLs
    document.querySelectorAll('.course-button').forEach(button => {
        button.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            const url = this.href;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Course URL copied to clipboard!', 'success');
            });
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }

        // Escape to clear search
        if (e.key === 'Escape' && searchInput) {
            searchInput.blur();
        }
    });

    // Add search suggestions (mock data for demo)
    if (searchInput) {
        const suggestions = [
            'Machine Learning',
            'Data Science',
            'Python Programming',
            'Web Development',
            'Digital Marketing',
            'Project Management',
            'Artificial Intelligence',
            'Cloud Computing',
            'Cybersecurity',
            'Business Analytics'
        ];

        let suggestionBox = null;

        searchInput.addEventListener('focus', function() {
            showSuggestions();
        });

        searchInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            if (value.length > 0) {
                const filtered = suggestions.filter(s => 
                    s.toLowerCase().includes(value)
                );
                showSuggestions(filtered);
            } else {
                showSuggestions();
            }
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.input-wrapper')) {
                hideSuggestions();
            }
        });

        function showSuggestions(filtered = suggestions.slice(0, 5)) {
            hideSuggestions();
            
            if (filtered.length === 0) return;

            suggestionBox = document.createElement('div');
            suggestionBox.className = 'suggestions-box';
            suggestionBox.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
                margin-top: 4px;
            `;

            filtered.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = suggestion;
                item.style.cssText = `
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    border-bottom: 1px solid var(--border-color);
                    transition: background-color 0.2s ease;
                `;

                item.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = 'var(--bg-secondary)';
                });

                item.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                });

                item.addEventListener('click', function() {
                    searchInput.value = suggestion;
                    hideSuggestions();
                    searchInput.focus();
                });

                suggestionBox.appendChild(item);
            });

            const inputWrapper = searchInput.closest('.input-wrapper');
            inputWrapper.style.position = 'relative';
            inputWrapper.appendChild(suggestionBox);
        }

        function hideSuggestions() {
            if (suggestionBox) {
                suggestionBox.remove();
                suggestionBox = null;
            }
        }
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Performance optimization
window.addEventListener('load', function() {
    // Preload critical images
    const criticalImages = [
        // Add any critical image URLs here
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Add loaded class for CSS animations
    document.body.classList.add('loaded');
});

// Error handling for external links
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', function(e) {
        try {
            // Track external link clicks if analytics is available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    event_category: 'external_link',
                    event_label: this.href
                });
            }
        } catch (error) {
            console.log('Analytics not available');
        }
    });
});