// Initialize the SQL generator application
function init() {
    console.log('SQL Generator initialized');
    loadForm();
    attachEventListeners();
}

// Load the form with any saved data
function loadForm() {
    const savedQuery = localStorage.getItem('sqlQuery');
    if (savedQuery) {
        document.getElementById('query').value = savedQuery;
    }
}

// Attach event listeners to form elements
function attachEventListeners() {
    const form = document.querySelector('form');
    form.addEventListener('submit', handleSubmit);

    const textarea = document.getElementById('query');
    textarea.addEventListener('input', saveQuery);
}

// Handle form submission
function handleSubmit(event) {
    event.preventDefault();
    const query = document.getElementById('query').value;
    if (query.trim()) {
        generateSQL(query);
        explainQuery(query);
    }
}

// Save query to localStorage
function saveQuery() {
    const query = document.getElementById('query').value;
    localStorage.setItem('sqlQuery', query);
}

// Generate SQL query based on user input
function generateSQL(userInput) {
    let sqlQuery = userInput.toLowerCase();

    // Simple SQL formatting and validation
    if (!sqlQuery.trim()) {
        showError('Please enter a query');
        return;
    }

    // Basic SQL formatting
    sqlQuery = sqlQuery.replace(/\s+/g, ' ');
    sqlQuery = sqlQuery.trim();

    // Display the generated SQL
    displayResult(sqlQuery, 'sql');
}

// Explain the query in plain English
function explainQuery(userInput) {
    const input = userInput.toLowerCase();
    let explanation = '';

    if (input.includes('select')) {
        explanation = 'This is a SELECT query that retrieves data from tables.';
    } else if (input.includes('insert')) {
        explanation = 'This is an INSERT query that adds new data to a table.';
    } else if (input.includes('update')) {
        explanation = 'This is an UPDATE query that modifies existing data in a table.';
    } else if (input.includes('delete')) {
        explanation = 'This is a DELETE query that removes data from a table.';
    } else if (input.includes('create table')) {
        explanation = 'This is a CREATE TABLE query that creates a new table structure.';
    } else {
        explanation = 'This is a generic SQL query. Please review it carefully.';
    }

    // Display the explanation
    displayResult(explanation, 'explanation');
}

// Display result in the UI
function displayResult(text, type) {
    const container = document.querySelector('.container');
    const resultElement = document.createElement('div');
    resultElement.className = type === 'sql' ? 'success' : 'info';
    resultElement.textContent = text;

    // Clear previous results
    const results = document.querySelectorAll('.success, .error, .info');
    results.forEach(result => result.remove());

    // Add new result
    container.appendChild(resultElement);
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');
    const errorElement = document.createElement('div');
    errorElement.className = 'error';
    errorElement.textContent = message;

    container.appendChild(errorElement);
}