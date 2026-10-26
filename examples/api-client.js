/**
 * API Client Example
 * Demonstrates usage of readme-sync with real code
 * This file is referenced in EXAMPLES.md
 */

const https = require('https');

/**
 * Simple HTTP client for API requests
 */
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Make a GET request
   * @param {string} endpoint 
   * @returns {Promise<any>}
   */
  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  /**
   * Make a POST request with data
   * @param {string} endpoint 
   * @param {object} data 
   * @returns {Promise<any>}
   */
  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  /**
   * Generic request method
   * @param {string} method 
   * @param {string} endpoint 
   * @param {object} data 
   */
  request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
      }

      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(body);
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }
}

module.exports = { APIClient };
