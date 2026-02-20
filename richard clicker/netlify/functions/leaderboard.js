const fs = require('fs');
const path = require('path');

// Path to scores.json
const filePath = path.join(__dirname, 'scores.json');

exports.handler = async (event, context) => {
  let scores = [];

  // Read existing scores
  try {
    scores = JSON.parse(fs.readFileSync(filePath));
  } catch (err) {
    scores = [];
  }

  if (event.httpMethod === "POST") {
    const { name, score } = JSON.parse(event.body);
    if (!name || typeof score !== "number") {
      return { statusCode: 400, body: "Invalid data" };
    }

    // Add new score
    scores.push({ name, score });

    // Sort descending and keep top 10
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(scores, null, 2));

    return { statusCode: 200, body: JSON.stringify(scores) };
  }

  // GET request returns current leaderboard
  return {
    statusCode: 200,
    body: JSON.stringify(scores)
  };
};
