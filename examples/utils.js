/**
 * Example utility module for testing readme-sync
 */

/**
 * Adds two numbers together
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - Sum of a and b
 */
function add(a, b) {
  return a + b;
}

/**
 * Greets a user with a personalized message
 * @param {string} name - The user's name
 * @returns {string} - Greeting message
 */
function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = { add, greet };
