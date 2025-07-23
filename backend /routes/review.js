const express = require('express');
const router = express.Router();
const db = require('../database');


// Helper to convert ISO to MySQL DATETIME
function formatToMySQLDatetime(isoString) {
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

//  Submit a new review and post it to backend
router.post('/postreview', async (req, res) => {
  const {
    id,
    responseId,
    taskId,
    projectId,
    comments,
    reviewedBy,
    reviewedAt,
    status
  } = req.body;

  try {
    const formattedDate = formatToMySQLDatetime(reviewedAt);

    await db.query(
      `INSERT INTO reviews 
        (id, responseId, taskId, projectId, comments, reviewedBy, reviewedAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, responseId, taskId, projectId, comments, reviewedBy, formattedDate, status]
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

//return all reviews
router.get("/allreviews", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reviews");
    res.status(200).json({ reviews: rows });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// getting reviews with status final review
router.get('/reviewstatfinal', async (req, res) => {
  const { status } = req.query;

  try {
    let query = 'SELECT * FROM reviews';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const [rows] = await db.query(query, params);
    res.status(200).json({ reviews: rows });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

 //GET a review by responseId and status
router.get("/", async (req, res) => {
  const { responseId, status } = req.query;
  if (!responseId || !status) {
    return res.status(400).json({ error: "Missing responseId or status" });
  }
  try {
    // Accept comma-separated list or single status
    const statuses = String(status).split(",");
    const placeholders = statuses.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT * FROM reviews WHERE responseId = ? AND status IN (${placeholders}) ORDER BY reviewedAt DESC LIMIT 1`,
      [responseId, ...statuses]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json({ review: rows[0] });
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ error: "Failed to fetch review" });
  }
});


//posting final review to backend

router.post('/finalrev', async (req, res) => {
  const {
    id,
    reviewId,
    responseId,
    taskId,
    projectId,
    comments,
    approvedBy,
    approvedAt,
    status,
  } = req.body;

  try {
    await db.query(
      'INSERT INTO finals (id, reviewId, responseId, taskId, projectId, comments, approvedBy, approvedAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, reviewId, responseId, taskId, projectId, comments, approvedBy, approvedAt, status]
    );

    res.status(201).json({ message: "Final review submitted successfully" });
  } catch (err) {
    console.error("Error submitting final review:", err);
    res.status(500).json({ error: "Failed to submit final review" });
  }
});


//update review status

router.put('/:id', async (req, res) => {
  const reviewId = req.params.id;
  const { status } = req.body;

  try {
    await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, reviewId]);
    res.status(200).json({ message: 'Review updated successfully' });
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ error: "Failed to update review" });
  }
});


// GET review by response id
router.get("/resId", async (req, res) => {
  const { responseId } = req.query;
  if (!responseId)
    return res.status(400).json({ error: "Missing responseId in query" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM reviews WHERE responseId = ? LIMIT 1",
      [responseId]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Review not found" });

    res.json({ review: rows[0] });
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

// GET /api/finals by review id
router.get("/revId", async (req, res) => {
  const { reviewId } = req.query;
  if (!reviewId)
    return res.status(400).json({ error: "Missing reviewId in query" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM finals WHERE reviewId = ? LIMIT 1",
      [reviewId]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Final approval not found" });

    res.json({ final: rows[0] });
  } catch (err) {
    console.error("Error fetching final:", err);
    res.status(500).json({ error: "Failed to fetch final" });
  }
});



module.exports = router;
