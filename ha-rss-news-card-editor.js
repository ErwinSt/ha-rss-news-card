const LitElement = window.LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = window.lit.html;
const css = window.lit.css;

class HaRssNewsCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object }
    };
  }
  
  constructor() {
    super();
    this.hass = {};
    this._config = {};
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
      }
      .row {
        display: flex;
        flex-direction: row;
        margin: 8px 0;
        align-items: center;
      }
      .label {
        width: 120px;
        margin-right: 16px;
      }
      ha-textfield, ha-select, ha-switch {
        width: 100%;
      }
      ha-switch {
        --mdc-switch-selected-track-color: var(--primary-color);
        --mdc-switch-selected-handle-color: var(--primary-color);
      }
      .entities {
        margin-left: 8px;
      }
    `;
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = {
      title: 'RSS News',
      url: '',
      entity: '',
      max_items: 5,
      show_date: true,
      show_image: true,
      date_format: 'relative',
      use_proxy: true,
      ...config
    };
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    
    const target = ev.target;
    const name = target.name || target.getAttribute('name');
    let value = target.value;
    
    if (target.type === 'checkbox') {
      value = target.checked;
    } else if (target.type === 'number') {
      value = parseInt(value, 10);
    }
    
    if (this._config[name] === value) {
      return;
    }
    
    const newConfig = { ...this._config, [name]: value };
    
    // If entity is set, clear the URL field
    if (name === 'entity' && value) {
      newConfig.url = '';
    }
    
    // If URL is set, clear the entity field
    if (name === 'url' && value) {
      newConfig.entity = '';
    }
    
    this._config = newConfig;
    
    const configEvent = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    
    this.dispatchEvent(configEvent);
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    // Get sensor entities that might contain URLs
    const sensorEntities = Object.keys(this.hass.states)
      .filter(entityId => entityId.startsWith('sensor.'))
      .map(entityId => ({
        value: entityId,
        label: this.hass.states[entityId].attributes.friendly_name || entityId,
      }));

    return html`
      <div class="form">
        <div class="row">
          <div class="label">Titre</div>
          <ha-textfield
            name="title"
            .value="${this._config.title || ''}"
            .configValue="${"title"}"
            @change="${this._valueChanged}"
          ></ha-textfield>
        </div>
        
        <div class="row">
          <div class="label">URL du flux</div>
          <ha-textfield
            name="url"
            .value="${this._config.url || ''}"
            .placeholder="https://exemple.com/rss.xml"
            .configValue="${"url"}"
            @change="${this._valueChanged}"
            .disabled="${Boolean(this._config.entity)}"
          ></ha-textfield>
        </div>
        
        <div class="row">
          <div class="label">OU Entité URL</div>
          <ha-select
            name="entity"
            .value="${this._config.entity || ''}"
            .configValue="${"entity"}"
            @change="${this._valueChanged}"
            .disabled="${Boolean(this._config.url)}"
          >
            <ha-list-item value="">Aucune</ha-list-item>
            ${sensorEntities.map(entity => html`
              <ha-list-item .value="${entity.value}">${entity.label}</ha-list-item>
            `)}
          </ha-select>
        </div>
        
        <div class="row">
          <div class="label">Maximum d'articles</div>
          <ha-textfield
            name="max_items"
            type="number"
            min="1"
            max="20"
            .value="${this._config.max_items || 5}"
            .configValue="${"max_items"}"
            @change="${this._valueChanged}"
          ></ha-textfield>
        </div>
        
        <div class="row">
          <div class="label">Afficher les dates</div>
          <ha-switch
            name="show_date"
            .checked="${this._config.show_date !== false}"
            .configValue="${"show_date"}"
            @change="${this._valueChanged}"
          ></ha-switch>
        </div>
        
        <div class="row">
          <div class="label">Afficher les images</div>
          <ha-switch
            name="show_image"
            .checked="${this._config.show_image !== false}"
            .configValue="${"show_image"}"
            @change="${this._valueChanged}"
          ></ha-switch>
        </div>
        
        <div class="row">
          <div class="label">Format de date</div>
          <ha-select
            name="date_format"
            .value="${this._config.date_format || 'relative'}"
            .configValue="${"date_format"}"
            @change="${this._valueChanged}"
          >
            <ha-list-item value="relative">Relatif (il y a 2 heures)</ha-list-item>
            <ha-list-item value="standard">Standard (JJ/MM/AAAA)</ha-list-item>
          </ha-select>
        </div>
        
        <div class="row">
          <div class="label">Utiliser le proxy</div>
          <ha-switch
            name="use_proxy"
            .checked="${this._config.use_proxy !== false}"
            .configValue="${"use_proxy"}"
            @change="${this._valueChanged}"
          ></ha-switch>
        </div>
      </div>
    `;
  }
}

// Register the editor
customElements.define('ha-rss-news-card-editor', HaRssNewsCardEditor);
