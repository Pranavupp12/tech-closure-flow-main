const express = require('express');
const router = express.Router();
const db = require('../database');

//taking response from assignee and storing it in sql
router.post('/response', async (req, res) => {

function formatToMySQLDatetime(isoString) {
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}


  let { id, taskId, projectId, comments, attachments, respondedBy, respondedAt, status } = req.body;

  respondedAt=formatToMySQLDatetime(respondedAt);

  try {
    const [result] = await db.query(
      `INSERT INTO responses 
        (id, taskId, projectId, comments, attachments, respondedBy, respondedAt, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, taskId, projectId, comments, JSON.stringify(attachments), respondedBy, respondedAt, status]
    );

    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (err) {
    console.error("Error inserting response:", err);
    res.status(500).json({ error: 'Failed to submit response' });
  }
});

//getting all responses
router.get("/allresponses", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM responses");
    res.status(200).json({ responses: rows });
  } catch (err) {
    console.error("Error fetching responses:", err);
    res.status(500).json({ error: "Failed to fetch responses" });
  }
});

module.exports = router;


// Get all responses that need review
router.get('/responses', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM responses WHERE status = "review"');
    res.status(200).json({ responses: rows });
  } catch (err) {
    console.error('Error fetching responses:', err);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Get a specific response for a task with a certain status
router.get('/', async (req, res) => {
  const { taskId, status } = req.query;

  if (!taskId || !status) {
    return res.status(400).json({ error: "taskId and status are required" });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM responses WHERE taskId = ? AND status = ? LIMIT 1',
      [taskId, status]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No response found for this task with the given status" });
    }

    res.status(200).json({ response: rows[0] });
  } catch (err) {
    console.error("Error fetching response:", err);
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

// GET response by taskId
router.get("/by-task", async (req, res) => {
  const { taskId } = req.query;

  if (!taskId) {
    return res.status(400).json({ error: "Missing taskId in query" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM responses WHERE taskId = ? LIMIT 1",
      [taskId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Response not found" });
    }

    res.json({ response: rows[0] });
  } catch (err) {
    console.error("Error fetching response:", err);
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

// update response status
router.put('/:id', async (req, res) => {
  const responseId = req.params.id;
  const { status } = req.body;

  try {
    await db.query('UPDATE responses SET status = ? WHERE id = ?', [status, responseId]);
    res.status(200).json({ message: 'Response updated successfully' });
  } catch (err) {
    console.error("Error updating response:", err);
    res.status(500).json({ error: "Failed to update response" });
  }
});



module.exports = router;
