// Ce fichier doit être placé dans custom_components/rss_proxy/
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/rss-proxy', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'application/xml');
    
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error('RSS proxy error:', error);
    res.status(500).send('Error fetching RSS feed');
  }
});

module.exports = router;
