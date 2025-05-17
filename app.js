// Configuration
const SUPABASE_URL = 'https://nlejaciidjebkufybtpx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZWphY2lpZGplYmt1ZnlidHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDkyMjYsImV4cCI6MjA1ODM4NTIyNn0.xXsukS0EdDRdpy0t4aDIFJJa4nYH4_50ismmHmKwpHk';

// Global state
let currentVideo = null;
let isLoading = true;
let isCopying = false;
let isReporting = false;

// Button text options for variety
const buttonTexts = [
  "Keep Them Coming!",
  "Hit me with Another!",
  "Surprise Me!",
  "Show me Another One", 
  "What else you got?",
  "Next, Please!",
  "Keep Them Coming!",
  "Hit me with Another!"
];

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  setupEventListeners();
  
  // Initialize page based on URL parameters
  initializePage();
});

// Set up all event listeners
function setupEventListeners() {
  // Video player events
  // Remove: const playerWrapper = document.getElementById('player-wrapper');
  // Remove: if (playerWrapper) { playerWrapper.addEventListener('click', playVideo); }
  
  // Button events
  const stumbleButton = document.getElementById('stumble-button');
  const shareButtonFixed = document.getElementById('share-button-fixed');
  const shareButtonInline = document.getElementById('share-button-inline');
  const reportButton = document.getElementById('report-button');
  const moreButton = document.getElementById('more-button');
  const infoButton = document.getElementById('info-button');
  const submitButton = document.getElementById('submit-button');
  const subscribeButton = document.getElementById('subscribe-button');
  
  if (stumbleButton) {
    stumbleButton.addEventListener('click', handleStumble);
  }
  
  if (shareButtonFixed) {
    shareButtonFixed.addEventListener('click', handleShare);
  }
  
  if (shareButtonInline) {
    shareButtonInline.addEventListener('click', handleShare);
  }
  
  if (reportButton) {
    reportButton.addEventListener('click', handleReport);
  }
  
  if (moreButton) {
    moreButton.addEventListener('click', handleMore);
  }
  
  if (infoButton) {
    infoButton.addEventListener('click', handleInfo);
  }
  
  if (submitButton) {
    submitButton.addEventListener('click', handleSubmit);
  }
  
  if (subscribeButton) {
    subscribeButton.addEventListener('click', handleSubscribe);
  }

  // New About and More popup modals (for both index and video pages)
  const aboutButton = document.getElementById('about-button');
  const aboutModal = document.getElementById('about-modal');
  const closeAboutModal = document.getElementById('close-about-modal');
  const morePopupButton = document.getElementById('more-popup-button');
  const moreModal = document.getElementById('more-modal');
  const closeMoreModal = document.getElementById('close-more-modal');
  const reportVideoModalButton = document.getElementById('report-video-modal-button');

  if (aboutButton && aboutModal) {
    aboutButton.addEventListener('click', () => {
      aboutModal.style.display = 'flex';
    });
  }
  if (closeAboutModal && aboutModal) {
    closeAboutModal.addEventListener('click', () => {
      aboutModal.style.display = 'none';
    });
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) aboutModal.style.display = 'none';
    });
  }
  if (morePopupButton && moreModal) {
    morePopupButton.addEventListener('click', () => {
      moreModal.style.display = 'flex';
    });
  }
  if (closeMoreModal && moreModal) {
    closeMoreModal.addEventListener('click', () => {
      moreModal.style.display = 'none';
    });
    moreModal.addEventListener('click', (e) => {
      if (e.target === moreModal) moreModal.style.display = 'none';
    });
  }
  if (reportVideoModalButton) {
    reportVideoModalButton.addEventListener('click', () => {
      // Try to get currentVideo if available, else just open mailto
      let videoId = null;
      if (typeof currentVideo !== 'undefined' && currentVideo && currentVideo.video_id) {
        videoId = currentVideo.video_id;
      }
      const subject = videoId ? encodeURIComponent(`This video id (${videoId}) video not working.`) : encodeURIComponent('Video not working');
      const mailto = `mailto:report@thewatchworthy.com?subject=${subject}`;
      window.location.href = mailto;
    });
  }
}

// Initialize the page based on URL parameters
async function initializePage() {
  setLoading(true);
  
  const isVideoPage = window.isVideoPage || false;
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = isVideoPage ? urlParams.get('id') : urlParams.get('video');
  
  if (videoId) {
    // Load specific video from URL parameter
    try {
      const video = await getVideoById(videoId);
      if (video) {
        updateUI(video);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading video:', error);
    }
  }
  
  // If no video ID in URL or video not found, fetch a random video (only on home page)
  if (!isVideoPage) {
    await fetchRandomVideo();
  } else {
    // On video page with no valid ID, show error
    showErrorState("Video not found");
    setLoading(false);
  }
}

// Play the video when thumbnail is clicked
function playVideo() {
  if (!currentVideo) return;
  
  // Create an iframe for the YouTube video
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', `https://www.youtube.com/embed/${currentVideo.video_id}?autoplay=1&rel=0`);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  
  // Clear the player wrapper and insert the iframe
  const playerWrapper = document.getElementById('player-wrapper');
  if (playerWrapper) {
    playerWrapper.innerHTML = '';
    playerWrapper.appendChild(iframe);
  }
}

// Handle clicking the "Stumble" button
async function handleStumble() {
  if (isLoading) return;
  
  // Add pressed effect
  const stumbleButton = document.getElementById('stumble-button');
  if (stumbleButton) {
    stumbleButton.classList.add('pressed');
    setTimeout(() => stumbleButton.classList.remove('pressed'), 300);
  
    // Generate random button text
    const randomIndex = Math.floor(Math.random() * buttonTexts.length);
    stumbleButton.textContent = buttonTexts[randomIndex];
  }
  
  // Reset video player
  resetVideoPlayer();
  
  // Fetch new random video
  await fetchRandomVideo();
}

// Reset the video player state
function resetVideoPlayer() {
  const playerWrapper = document.getElementById('player-wrapper');
  if (!playerWrapper) return;
  
  playerWrapper.innerHTML = `
    <img id="video-thumbnail" class="video-thumbnail hidden" alt="Video thumbnail">
    <div id="play-button" class="play-button">
      <i data-lucide="play" class="play-icon"></i>
    </div>
    <div id="video-title-overlay" class="video-title-overlay"></div>
  `;
  
  lucide.createIcons();

  // Attach playVideo to play button and thumbnail for better mobile support
  const playButton = playerWrapper.querySelector('#play-button');
  const videoThumbnail = playerWrapper.querySelector('#video-thumbnail');
  if (playButton) playButton.addEventListener('click', playVideo);
  if (videoThumbnail) videoThumbnail.addEventListener('click', playVideo);
}

// Fetch a random intellectual video
async function fetchRandomVideo() {
  setLoading(true);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=*&category=eq.Intellectual&limit=1000`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    const videos = await response.json();
    
    if (!videos || videos.length === 0) {
      showErrorState("No videos found");
      return;
    }
    
    // Select a random video from the results
    const randomIndex = Math.floor(Math.random() * videos.length);
    const randomVideo = videos[randomIndex];
    
    // Update UI with the new video
    updateUI(randomVideo);
    
    // Update URL with the new video ID (only on home page)
    if (!window.isVideoPage) {
      const url = new URL(window.location);
      url.searchParams.set('video', randomVideo.video_id);
      window.history.pushState({}, '', url);
    }
  } catch (error) {
    console.error('Error fetching random video:', error);
    showErrorState("Failed to load video");
  } finally {
    setLoading(false);
  }
}

// Get a specific video by its ID
async function getVideoById(videoId) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=*&video_id=eq.${videoId}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Accept': 'application/vnd.pgrst.object+json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
    
    const video = await response.json();
    return video;
  } catch (error) {
    console.error('Error fetching video by ID:', error);
    return null;
  }
}

// Update the UI with video data
function updateUI(video) {
  if (!video) return;
  
  currentVideo = video;
  
  // Set video title and remove skeleton loading class
  const videoTitle = document.getElementById('video-title');
  if (videoTitle) {
    videoTitle.textContent = video.title;
    videoTitle.classList.remove('skeleton-loading');
  }
  
  // Set channel name if applicable
  const channelNameElement = document.getElementById('channel-name');
  if (channelNameElement) {
    channelNameElement.textContent = video.channel_name || "The Watch Worthy";
  }
  
  // Set video title in overlay
  const videoTitleOverlay = document.getElementById('video-title-overlay');
  if (videoTitleOverlay) {
    videoTitleOverlay.textContent = video.title;
  }
  
  // Set video thumbnail with fallback
  const videoThumbnail = document.getElementById('video-thumbnail');
  if (videoThumbnail) {
    videoThumbnail.src = `https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`;
    videoThumbnail.alt = video.title;
    videoThumbnail.classList.remove('hidden');
    videoThumbnail.onerror = function() {
      if (videoThumbnail.src !== `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`) {
        videoThumbnail.src = `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`;
      }
    };
  }
  
  // Set backdrop image
  const videoBackdrop = document.getElementById('video-backdrop');
  if (videoBackdrop) {
    videoBackdrop.style.backgroundImage = `url(https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg)`;
  }

  // Re-attach play event listeners after DOM update
  const playerWrapper = document.getElementById('player-wrapper');
  if (playerWrapper) {
    const playButton = playerWrapper.querySelector('#play-button');
    const videoThumbnail = playerWrapper.querySelector('#video-thumbnail');
    if (playButton) playButton.addEventListener('click', playVideo);
    if (videoThumbnail) videoThumbnail.addEventListener('click', playVideo);
  }
}

// Show error state in the UI
function showErrorState(message) {
  const playerWrapper = document.getElementById('player-wrapper');
  if (playerWrapper) {
    playerWrapper.innerHTML = `
      <div class="error-message">
        ${message}
      </div>
    `;
  }
  
  const videoTitle = document.getElementById('video-title');
  if (videoTitle) {
    videoTitle.textContent = "Video not found";
    videoTitle.classList.remove('skeleton-loading');
  }
}

// Set loading state
function setLoading(loading) {
  isLoading = loading;
  
  const loadingSpinner = document.getElementById('loading-spinner');
  if (loadingSpinner) {
    loadingSpinner.style.display = loading ? 'block' : 'none';
  }
  
  const stumbleButton = document.getElementById('stumble-button');
  if (stumbleButton) {
    stumbleButton.disabled = loading;
    if (loading) {
      stumbleButton.innerHTML = `
        <div class="button-spinner"></div>
        Loading...
      `;
    } else {
      stumbleButton.textContent = buttonTexts[Math.floor(Math.random() * buttonTexts.length)];
    }
  }
}

// Handle share button click
async function handleShare() {
  if (!currentVideo || isCopying) return;
  
  try {
    isCopying = true;
    
    const shareButtonFixed = document.getElementById('share-button-fixed');
    const shareButtonInline = document.getElementById('share-button-inline');
    
    // Update button state
    if (shareButtonFixed) {
      shareButtonFixed.innerHTML = `
        <div class="button-spinner" style="border-top-color: var(--text-primary);"></div>
      `;
    }
    
    if (shareButtonInline) {
      shareButtonInline.innerHTML = `
        <div class="button-spinner" style="border-top-color: var(--text-primary);"></div>
        Copying...
      `;
    }
    
    // Generate the URL based on current page
    const baseUrl = window.location.origin;
    const shareUrl = window.isVideoPage
      ? `${baseUrl}/video.html?id=${currentVideo.video_id}`
      : `${baseUrl}/video.html?id=${currentVideo.video_id}`;
    
    // Try to use the clipboard API
    await navigator.clipboard.writeText(shareUrl);
    
    // Show success toast
    showToast("Link copied!", "Video link has been copied to your clipboard.");
  } catch (error) {
    console.error('Failed to copy:', error);
    showToast("Failed to copy link", "Please try again or copy the URL manually.", true);
  } finally {
    isCopying = false;
    
    // Restore button state
    const shareButtonFixed = document.getElementById('share-button-fixed');
    const shareButtonInline = document.getElementById('share-button-inline');
    
    if (shareButtonFixed) {
      shareButtonFixed.innerHTML = `<i data-lucide="share-2" class="icon"></i>`;
    }
    
    if (shareButtonInline) {
      shareButtonInline.innerHTML = `<i data-lucide="share-2" class="icon-small"></i> Share`;
    }
    
    // Re-initialize icons
    lucide.createIcons();
  }
}

// Handle report button click
function handleReport() {
  if (!currentVideo) return;
  const videoId = currentVideo.video_id;
  const subject = encodeURIComponent(`This video id (${videoId}) video not working.`);
  const mailto = `mailto:report@thewatchworthy.com?subject=${subject}`;
  window.location.href = mailto;
}

// Handle more options button click
function handleMore() {
  window.open('https://www.superpowwwer.com', '_blank');
}

// Handle info button click
function handleInfo() {
  showToast("About The Watch Worthy", "Discover intellectual and educational videos curated just for you.");
}

// Handle submit button click
function handleSubmit() {
  // Show loading state
  const submitButton = document.getElementById('submit-button');
  if (submitButton) {
    submitButton.innerHTML = `
      <div class="button-spinner" style="border-top-color: var(--text-primary);"></div>
    `;
  }
  
  // Simulate submission process
  setTimeout(() => {
    showToast("Thank you!", "Your submission has been received.");
    
    // Restore button state
    if (submitButton) {
      submitButton.innerHTML = `<i data-lucide="mail" class="icon"></i>`;
      lucide.createIcons();
    }
  }, 1000);
}

// Handle subscribe button click
function handleSubscribe() {
  // Open Tally modal for subscription
  window.location.href = '#tally-open=3qpDR5&tally-layout=modal&tally-hide-title=1&tally-overlay=1';
}

// Show toast notification
function showToast(title, message, isError = false) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
  
  toast.innerHTML = `
    <div class="toast-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
    <button class="toast-close">&times;</button>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Add event listener to close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 300);
    }
  }, 5000);
  
  // Animate in
  setTimeout(() => {
    toast.classList.add('toast-visible');
  }, 10);
}
