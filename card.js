// Main card file that handles dependency loading for HACS
import './ha-rss-news-card.js';
import './ha-rss-news-card-editor.js';

// Validate registration
setTimeout(() => {
  if (!customElements.get('ha-rss-news-card')) {
    console.error('ha-rss-news-card element failed to register!');
  }
  
  if (!customElements.get('rss-news-card')) {
    console.error('rss-news-card element failed to register!');
  }
  
  if (!customElements.get('ha-rss-news-card-editor')) {
    console.error('ha-rss-news-card-editor element failed to register!');
  }
  
  // Log confirmation
  console.info('RSS News Card loaded successfully!');
}, 2000);