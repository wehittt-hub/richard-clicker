const fs = require('fs');
const path = require('path');

// Use __dirname to point to the same folder as this file
const filePath = path.join(__dirname, 'scores.json');

exports.handler = async (event, context) => {
  let scores = [];

  try {
    // Read existing scores (if the file exists)
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      scores = JSON.parse(data);
    } else {
      // Create file if it doesn’t exist
      fs.writeFileSync(filePath, JSON.stringify([]));
      scores = [];
    }
  } catch (err) {
    console.error('Error reading scores.json:', err);
    return { statusCode: 500, body: 'Error reading scores' };
  }

  // Handle POST request → submit new score
  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      return { statusCode: 400, body: 'Invalid JSON' };
    }

    const { name, score } = body;

    if (!name || typeof score !== 'number') {
      return { statusCode: 400, body: 'Invalid data: name and numeric score required' };
    }

    // Add new score
    scores.push({ name, score });

    // Sort descending by score and keep top 10
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);

    try {
      fs.writeFileSync(filePath, JSON.stringify(scores, null, 2));
    } catch (err) {
      console.error('Error writing scores.json:', err);
      return { statusCode: 500, body: 'Error saving score' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(scores)
    };
  }

  // GET request → return top 10 scores
  return {
    statusCode: 200,
    body: JSON.stringify(scores)
  };
};

