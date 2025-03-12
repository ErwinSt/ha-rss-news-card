const LitElement = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = window.lit.html;
const css = window.lit.css;

class HaRssNewsCard extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      entity: { type: String },
      max_items: { type: Number },
      url: { type: String },
      show_date: { type: Boolean },
      show_image: { type: Boolean },
      date_format: { type: String },
      hass: { type: Object },
      _items: { type: Array },
      _loading: { type: Boolean },
      _error: { type: Boolean },
      use_proxy: { type: Boolean }
    };
  }
  
  constructor() {
    super();
    this.title = 'RSS News';
    this.entity = '';
    this.max_items = 5;
    this.url = '';
    this.show_date = true;
    this.show_image = true;
    this.date_format = 'relative';
    this._items = [];
    this._loading = true;
    this._error = false;
    this.use_proxy = true;
  }

  static get styles() {
    return css`
      :host {
        --card-background: var(--ha-card-background, var(--card-background-color, white));
        --card-text: var(--primary-text-color, #212121);
        --card-text-dim: var(--secondary-text-color, #727272);
        --divider-color: var(--divider-color, #e0e0e0);
        --accent-color: var(--primary-color, #03a9f4);
        display: block;
      }
      
      ha-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 0;
        background: var(--card-background);
        color: var(--card-text);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0px 2px 4px rgba(0, 0, 0, 0.1));
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 16px 12px;
      }
      
      .card-title {
        font-size: 1.4rem;
        font-weight: 500;
        margin: 0;
        color: var(--card-text);
      }
      
      .card-content {
        padding: 0;
        margin: 0;
        overflow-y: auto;
        flex: 1;
      }
      
      .news-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .news-item {
        display: flex;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        transition: background-color 0.2s ease;
      }
      
      .news-item:last-child {
        border-bottom: none;
      }
      
      .news-item:hover {
        background-color: rgba(0, 0, 0, 0.03);
        cursor: pointer;
      }
      
      .news-image-container {
        width: 80px;
        height: 80px;
        margin-right: 16px;
        flex-shrink: 0;
        border-radius: 8px;
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .news-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .news-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      
      .news-title {
        font-weight: 500;
        font-size: 1rem;
        margin: 0 0 8px 0;
        color: var(--card-text);
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      
      .news-description {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-size: 0.9rem;
        margin-bottom: 8px;
        color: var(--card-text-dim);
      }
      
      .news-date {
        font-size: 0.8rem;
        margin-top: auto;
        color: var(--card-text-dim);
      }
      
      .no-image {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--accent-color);
        color: white;
        font-weight: bold;
        font-size: 1.2rem;
      }
      
      .card-footer {
        padding: 12px 16px;
        border-top: 1px solid var(--divider-color);
        font-size: 0.8rem;
        color: var(--card-text-dim);
        text-align: center;
      }
      
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
        flex-direction: column;
      }
      
      .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: var(--accent-color);
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 16px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .error {
        padding: 24px 16px;
        text-align: center;
        color: var(--error-color, #db4437);
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchData();
  }

  async _fetchData() {
    this._loading = true;
    this._error = false;
    
    let url = this.url;
    
    // If entity is provided, try to get the URL from the entity state
    if (this.entity && this.hass && this.hass.states && this.hass.states[this.entity]) {
      url = this.hass.states[this.entity].state;
    }
    
    if (!url) {
      this._error = true;
      this._loading = false;
      return;
    }
    
    try {
      let fetchUrl = url;
      
      // Use Home Assistant as a proxy to avoid CORS issues
      if (this.use_proxy) {
        fetchUrl = `/api/rss_proxy?url=${encodeURIComponent(url)}`;
      }
      
      const response = await fetch(fetchUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch RSS feed');
      }
      
      let xmlContent;
      
      if (this.use_proxy) {
        const jsonResponse = await response.json();
        xmlContent = jsonResponse.content;
      } else {
        xmlContent = await response.text();
      }
      
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlContent, 'application/xml');
      
      // Check if it's Atom or RSS
      const isAtom = xml.querySelector('feed');
      const items = [];
      
      if (isAtom) {
        // Parse Atom feed
        const entries = xml.querySelectorAll('entry');
        entries.forEach(entry => {
          const title = entry.querySelector('title')?.textContent || 'No Title';
          const link = entry.querySelector('link')?.getAttribute('href') || '';
          const description = entry.querySelector('summary')?.textContent || 
                             entry.querySelector('content')?.textContent || '';
          const pubDate = entry.querySelector('published')?.textContent || 
                         entry.querySelector('updated')?.textContent || '';
          
          // Try to find an image
          let imageUrl = '';
          const mediaContent = entry.querySelector('media\\:content, content');
          if (mediaContent && mediaContent.getAttribute('url')) {
            imageUrl = mediaContent.getAttribute('url');
          } else {
            // Try to find image in the content
            const div = document.createElement('div');
            div.innerHTML = description;
            const img = div.querySelector('img');
            if (img && img.src) {
              imageUrl = img.src;
            }
          }
          
          items.push({ title, link, description, pubDate, imageUrl });
        });
      } else {
        // Parse RSS feed
        const entries = xml.querySelectorAll('item');
        entries.forEach(entry => {
          const title = entry.querySelector('title')?.textContent || 'No Title';
          const link = entry.querySelector('link')?.textContent || '';
          const description = entry.querySelector('description')?.textContent || '';
          const pubDate = entry.querySelector('pubDate')?.textContent || '';
          
          // Try to find an image
          let imageUrl = '';
          const mediaContent = entry.querySelector('media\\:content, content');
          if (mediaContent && mediaContent.getAttribute('url')) {
            imageUrl = mediaContent.getAttribute('url');
          } else {
            const enclosure = entry.querySelector('enclosure');
            if (enclosure && enclosure.getAttribute('type')?.startsWith('image/')) {
              imageUrl = enclosure.getAttribute('url');
            } else {
              // Try to find image in the description
              const div = document.createElement('div');
              div.innerHTML = description;
              const img = div.querySelector('img');
              if (img && img.src) {
                imageUrl = img.src;
              }
            }
          }
          
          items.push({ title, link, description, pubDate, imageUrl });
        });
      }
      
      // Limit the number of items
      this._items = items.slice(0, this.max_items);
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      this._error = true;
    } finally {
      this._loading = false;
    }
  }

  _formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return dateString; // Return as is if invalid
      }
      
      if (this.date_format === 'relative') {
        // Relative time
        const now = new Date();
        const diff = now - date;
        
        // Convert to seconds
        const seconds = Math.floor(diff / 1000);
        
        if (seconds < 60) {
          return 'à l\'instant';
        }
        
        // Convert to minutes
        const minutes = Math.floor(seconds / 60);
        
        if (minutes < 60) {
          return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        
        // Convert to hours
        const hours = Math.floor(minutes / 60);
        
        if (hours < 24) {
          return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        }
        
        // Convert to days
        const days = Math.floor(hours / 24);
        
        if (days < 30) {
          return `il y a ${days} jour${days > 1 ? 's' : ''}`;
        }
        
        // Convert to months
        const months = Math.floor(days / 30);
        
        if (months < 12) {
          return `il y a ${months} mois`;
        }
        
        // Convert to years
        const years = Math.floor(months / 12);
        
        return `il y a ${years} an${years > 1 ? 's' : ''}`;
      } else {
        // Standard formatted date
        return date.toLocaleDateString();
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }

  _getInitials(title) {
    if (!title) return '';
    return title
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  _handleItemClick(link) {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  }

  updated(changedProps) {
    if (changedProps.has('url') || changedProps.has('entity') || changedProps.has('hass')) {
      this._fetchData();
    }
  }

  render() {
    if (this._loading) {
      return html`
        <ha-card>
          <div class="card-header">
            <h2 class="card-title">${this.title}</h2>
          </div>
          <div class="loading">
            <div class="loading-spinner"></div>
            <div>Chargement du flux RSS...</div>
          </div>
        </ha-card>
      `;
    }

    if (this._error) {
      return html`
        <ha-card>
          <div class="card-header">
            <h2 class="card-title">${this.title}</h2>
          </div>
          <div class="error">
            <div>Impossible de charger le flux RSS.</div>
            <div>Vérifiez l'URL et réessayez.</div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <div class="card-header">
          <h2 class="card-title">${this.title}</h2>
        </div>
        <div class="card-content">
          <ul class="news-list">
            ${this._items.map(item => html`
              <li class="news-item" @click="${() => this._handleItemClick(item.link)}">
                ${this.show_image ? html`
                  <div class="news-image-container">
                    ${item.imageUrl ? 
                      html`<img class="news-image" src="${item.imageUrl}" alt="${item.title}">` :
                      html`<div class="news-image no-image">${this._getInitials(item.title)}</div>`
                    }
                  </div>
                ` : ''}
                <div class="news-content">
                  <h3 class="news-title">${item.title}</h3>
                  <p class="news-description">${item.description}</p>
                  ${this.show_date && item.pubDate ? html`
                    <div class="news-date">${this._formatDate(item.pubDate)}</div>
                  ` : ''}
                </div>
              </li>
            `)}
          </ul>
        </div>
        <div class="card-footer">
          Dernière mise à jour: ${this._formatDate(new Date().toString())}
        </div>
      </ha-card>
    `;
  }

  // Home Assistant specific: Returns the card size
  getCardSize() {
    return this.max_items + 1;
  }

  // Render editor UI when configuring the card in the Home Assistant UI
  static getConfigElement() {
    return document.createElement('ha-rss-news-card-editor');
  }

  // What should be the default config for the card
  static getStubConfig() {
    return {
      type: 'custom:ha-rss-news-card',
      title: 'RSS News',
      url: 'https://www.lemonde.fr/rss/une.xml',
      max_items: 5,
      show_date: true,
      show_image: true,
      date_format: 'relative',
      use_proxy: true
    };
  }
}

// According to Home Assistant custom card conventions, the element tag name
// should be the same as the type attribute but without the 'custom:' prefix
customElements.define('ha-rss-news-card', HaRssNewsCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'custom:ha-rss-news-card',
  name: 'RSS News Card',
  description: 'Card that displays RSS news feed',
  preview: false
});
