document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-links a');
   
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = document.querySelector(link.getAttribute('href'));
           
            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
           
            // Show target page
            if (targetPage) {
                targetPage.classList.add('active');
            }
           
            // Update active nav link
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
           
            // Scroll to top
            window.scrollTo(0, 0);
        });
    });

    // Actor Bio Handling
    document.querySelectorAll('.bio-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const actor = e.target.closest('.actor-card').dataset.actor;
            const bioPage = document.getElementById(`${actor}Bio`);
           
            // Hide current page
            document.querySelector('.page.active').classList.remove('active');
           
            // Show bio page
            if (bioPage) {
                bioPage.style.display = 'block';
            }
        });
    });

    // Back Button
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Hide all bio pages
            document.querySelectorAll('.bio-page').forEach(page => {
                page.style.display = 'none';
            });
           
            // Show actors page
            document.getElementById('actors').classList.add('active');
           
            // Update nav link
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            document.querySelector('.nav-links a[href="#actors"]').parentElement.classList.add('active');
        });
    });

    // Feedback Form
    document.getElementById('feedbackForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const feedback = {
            movie: formData.get('movieSelect'),
            name: formData.get('name'),
            email: formData.get('email'),
            feedback: formData.get('feedback'),
            rating: document.querySelector('.star.active')?.dataset.value || '0'
        };
       
        // Here you would typically send the feedback to a server
        console.log('Feedback submitted:', feedback);
        alert('Thank you for your feedback!');
        e.target.reset();
       
        // Reset stars
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
        });
    });

    // Feedback Buttons on Movies
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Set the movie selection based on which card was clicked
            const movieTitle = btn.closest('.movie-card').querySelector('h3').textContent;
            const select = document.getElementById('movieSelect');
           
            // Find and select the matching option
            for (let option of select.options) {
                if (option.text === movieTitle) {
                    option.selected = true;
                    break;
                }
            }
           
            // Navigate to contact page
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.getElementById('contact').classList.add('active');
           
            // Update nav link
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            document.querySelector('.nav-links a[href="#contact"]').parentElement.classList.add('active');
        });
    });

    // Star Rating
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', (e) => {
            const value = e.target.dataset.value;
            const stars = document.querySelectorAll('.star');
           
            stars.forEach((s, index) => {
                if (index < value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Video Control for Bio Pages
    let player;
    function onYouTubeIframeAPIReady() {
        // This function will be called by the YouTube API
        document.querySelectorAll('iframe').forEach(iframe => {
            new YT.Player(iframe, {
                events: {
                    'onReady': onPlayerReady
                }
            });
        });
    }

    function onPlayerReady(event) {
        // Pause video when switching away
        document.querySelectorAll('.bio-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                event.target.pauseVideo();
            });
        });
    }

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});