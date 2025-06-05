document.addEventListener('DOMContentLoaded', () => {
    // --- Initial setup for utag_data for SPA navigation ---
    // Ensure utag_data is always available globally
    window.utag_data = window.utag_data || {};

    // Helper function to reset utag_data for a new "page" view in SPA.
    // This clears previous event-specific data before a new view fires.
    const resetTealiumDataLayer = () => {
        // Keep essential page-level data constant or update if truly changed
        window.utag_data = {
            page_title: document.title, // Always get current document title
            page_url: window.location.href, // Always get current URL
            page_referrer: document.referrer, // This will be the previous internal URL for SPA
            page_language: "en",
            site_country: "IN",
            // You might want to carry over some user data if available
            // user_id: window.utag_data.user_id || 'guest',
            // logged_in_status: window.utag_data.logged_in_status || 'false',
        };
    };

    // Navigation
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = document.querySelector(link.getAttribute('href'));
            const pageId = link.getAttribute('href').substring(1); // e.g., "home", "movies", "actors", "contact"
            const pageTitleMapping = {
                "home": "Home",
                "movies": "Movies",
                "actors": "Actors",
                "contact": "Contact"
            };

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

            // --- Tealium: Track Virtual Page View for Navigation ---
            if (typeof utag !== 'undefined') { // Ensure utag is loaded before using it
                resetTealiumDataLayer(); // Reset data layer for the new virtual page
                window.utag_data.page_type = "content_page";
                window.utag_data.page_name = `mymovie.com:${pageId}`;
                window.utag_data.page_section = pageId; // New variable for section
                window.utag_data.page_title = `MyMovie.com | ${pageTitleMapping[pageId] || pageId}`; // More descriptive title
                window.utag_data.page_url = `${window.location.origin}${window.location.pathname}#${pageId}`; // Simulate URL change for SPA
                utag.view(window.utag_data); // Fire utag.view for SPA navigation
            }
            // --- End Tealium ---
        });
    });

    // Actor Bio Handling
    document.querySelectorAll('.bio-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const actorCard = e.target.closest('.actor-card');
            const actorId = actorCard.dataset.actor; // e.g., "tom", "daniel", "christian"
            const actorName = actorCard.querySelector('h3').textContent; // e.g., "Tom Cruise"
            const bioPage = document.getElementById(`${actorId}Bio`);

            // Hide current page
            document.querySelector('.page.active').classList.remove('active');

            // Show bio page
            if (bioPage) {
                bioPage.style.display = 'block';
            }

            // --- Tealium: Track Actor Bio View (as a virtual page view) ---
            if (typeof utag !== 'undefined') {
                resetTealiumDataLayer(); // Reset data layer for new virtual page
                window.utag_data.page_type = "actor_bio_page";
                window.utag_data.page_name = `mymovie.com:actor:${actorId}`;
                window.utag_data.page_section = "actors"; // Section where this view occurs
                window.utag_data.actor_id = actorId;
                window.utag_data.actor_name = actorName;
                window.utag_data.page_title = `MyMovie.com | Actor Bio: ${actorName}`;
                window.utag_data.page_url = `${window.location.origin}${window.location.pathname}#actor_bio_${actorId}`; // Simulate URL change
                utag.view(window.utag_data);
            }
            // --- End Tealium ---
        });
    });

    // Back Button (from Bio Page)
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

            // --- Tealium: Track navigation back to Actors page (virtual page view) ---
            if (typeof utag !== 'undefined') {
                resetTealiumDataLayer(); // Reset data layer for new virtual page
                window.utag_data.page_type = "content_page";
                window.utag_data.page_name = "mymovie.com:actors";
                window.utag_data.page_section = "actors";
                window.utag_data.page_title = "MyMovie.com | Actors";
                window.utag_data.page_url = `${window.location.origin}${window.location.pathname}#actors`;
                utag.view(window.utag_data);
            }
            // --- End Tealium ---
        });
    });

    // Feedback Form
    document.getElementById('feedbackForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const feedback = {
            movie: formData.get('movieSelect'),
            name: formData.get('userName'),
            email: formData.get('userEmail'),
            feedbackText: formData.get('userFeedback'),
            rating: document.querySelector('.star.active')?.dataset.value || '0'
        };

        // --- Tealium Data Layer Population for form submission event ---
        if (typeof utag !== 'undefined') {
            resetTealiumDataLayer(); // Clear any existing view data, or merge if preferred
            window.utag_data.event_name = "movie_feedback_submit"; // Custom event name
            window.utag_data.event_category = "engagement"; // Category for the event
            window.utag_data.movie_selected = feedback.movie;
            window.utag_data.feedback_rating = feedback.rating;
            // IMPORTANT: Consider hashing or anonymizing PII like name/email before sending
            // e.g., window.utag_data.user_hashed_email = sha256(feedback.email);
            window.utag_data.user_name = feedback.name;
            window.utag_data.user_email = feedback.email;
            window.utag_data.feedback_text = feedback.feedbackText; // Be careful with collecting raw text feedback
            window.utag_data.page_context = "contact_page"; // Context of where the event occurred

            // --- Fire the Tealium Event ---
            utag.link(window.utag_data); // Use utag.link() for event tracking
        }
        // --- End Tealium ---

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
            const movieCard = btn.closest('.movie-card');
            const movieTitle = movieCard.querySelector('h3').textContent;
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

            // --- Tealium: Track click to give feedback for a specific movie ---
            if (typeof utag !== 'undefined') {
                resetTealiumDataLayer(); // Clear previous view data
                window.utag_data.event_name = "give_feedback_click";
                window.utag_data.event_category = "interaction";
                window.utag_data.movie_clicked_for_feedback = movieTitle;
                window.utag_data.page_context = "movies_page"; // Context of where the event occurred
                window.utag_data.page_type = "content_page";
                window.utag_data.page_name = "mymovie.com:contact"; // The destination page
                utag.link(window.utag_data); // Use utag.link for this interaction
            }
            // --- End Tealium ---
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

            // --- Tealium: Track Star Rating Click ---
            if (typeof utag !== 'undefined') {
                // No need to reset data layer fully here, just extend it for this specific interaction
                utag.link({
                    event_name: "star_rating_selected",
                    event_category: "form_interaction",
                    rating_value: value,
                    page_context: "feedback_form"
                });
            }
            // --- End Tealium ---
        });
    });

    // Download Bio Buttons
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bioPage = e.target.closest('.bio-page');
            let actorName = "Unknown Actor";
            if (bioPage && bioPage.querySelector('h2')) {
                actorName = bioPage.querySelector('h2').textContent;
            }

            // --- Tealium: Track Download Bio Click ---
            if (typeof utag !== 'undefined') {
                utag.link({
                    event_name: "download_bio_click",
                    event_category: "download",
                    actor_name: actorName,
                    file_type: "pdf",
                    page_context: "actor_bio_page"
                });
            }
            // --- End Tealium ---
        });
    });


    // Video Control for Bio Pages (YouTube API)
    // You'll need to define onYouTubeIframeAPIReady globally for the YouTube API to call it.
    // Also, fix the YouTube API loading URL.
    window.onYouTubeIframeAPIReady = function() {
        document.querySelectorAll('iframe').forEach(iframe => {
            // Check if the iframe src starts with the YouTube embed domain
            if (iframe.src.includes('youtube.com/embed/')) { // Changed to proper YouTube embed URL pattern
                new YT.Player(iframe, {
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange // Add state change listener
                    }
                });
            }
        });
    };

    function onPlayerReady(event) {
        // Pause video when switching away
        document.querySelectorAll('.bio-btn, .back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Ensure the event.target is a player and it has the pauseVideo method
                if (event.target && typeof event.target.pauseVideo === 'function') {
                    event.target.pauseVideo();
                }
            });
        });
    }

    function onPlayerStateChange(event) {
        // This function will fire when the player's state changes (play, pause, end)
        if (typeof utag !== 'undefined') {
            let videoState;
            let playerAction = 'unknown';
            const videoData = event.target.getVideoData();
            const videoId = videoData ? videoData.video_id : 'unknown';
            const videoTitle = videoData ? videoData.title : 'unknown';

            switch (event.data) {
                case YT.PlayerState.PLAYING:
                    videoState = 'playing';
                    playerAction = 'play';
                    break;
                case YT.PlayerState.PAUSED:
                    videoState = 'paused';
                    playerAction = 'pause';
                    break;
                case YT.PlayerState.ENDED:
                    videoState = 'ended';
                    playerAction = 'complete';
                    break;
                case YT.PlayerState.BUFFERING:
                    videoState = 'buffering';
                    playerAction = 'buffer';
                    break;
                default:
                    return; // Don't track other states
            }

            utag.link({
                event_name: `video_playback_${playerAction}`,
                event_category: "video",
                video_platform: "youtube",
                video_id: videoId,
                video_title: videoTitle,
                video_state: videoState,
                current_time: event.target.getCurrentTime(),
                total_duration: event.target.getDuration(),
                page_context: "actor_bio_page"
            });
        }
    }

    // Load YouTube API
    const tag = document.createElement('script');
    // FIX: The YouTube API URL is incorrect in your original code.
    // It should be 'https://www.youtube.com/iframe_api'.
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
