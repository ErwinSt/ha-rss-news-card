"""RSS Proxy component for Home Assistant."""
import logging
import os

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
import requests

_LOGGER = logging.getLogger(__name__)

DOMAIN = "rss_proxy"
API_URL = "/api/rss_proxy"

async def async_setup(hass: HomeAssistant, config):
    """Set up the RSS Proxy component."""
    hass.http.register_view(RSSProxyView())
    _LOGGER.info("RSS Proxy component initialized")
    return True

class RSSProxyView(HomeAssistantView):
    """RSS Proxy view to handle requests."""

    url = API_URL
    name = "api:rss_proxy"
    requires_auth = False
    cors_allowed = True

    async def get(self, request):
        """Handle GET request."""
        url = request.query.get("url")
        if not url:
            return self.json({"error": "URL parameter is required"}, status_code=400)
        
        _LOGGER.debug("Fetching RSS feed from: %s", url)
        try:
            response = await self._fetch_url(hass, url)
            return self.json({"content": response})
        except Exception as e:
            _LOGGER.error("Error fetching RSS feed: %s", str(e))
            return self.json({"error": str(e)}, status_code=500)
    
    async def _fetch_url(self, hass, url):
        """Fetch URL content."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        try:
            session = requests.Session()
            response = session.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            _LOGGER.error("Failed to fetch URL %s: %s", url, str(e))
            raise