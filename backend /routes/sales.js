const express = require('express');
const router = express.Router();
const db = require('../database');


//creating a new customer

router.post('/createcustomer', async (req, res) => {
  let { id, name, createdBy, createdAt } = req.body;

  try {
    // Convert ISO to MySQL DATETIME format
    createdAt = formatToMySQLDatetime(createdAt);

    await db.query(
      'INSERT INTO customers (id, name, createdBy, createdAt) VALUES (?, ?, ?, ?)',
      [id, name, createdBy, createdAt]
    );
    res.status(201).json({ message: 'Customer created successfully' });
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

function formatToMySQLDatetime(isoString) {
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// getting customer
router.get('/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers');
    res.status(200).json({ customers: rows });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});


//posting details into db created by sales team
router.post('/createproject', async (req, res) => {
  const {
    id,
    customerId,
    title,
    details,
    startDate,
    endDate,
    inlineInspection,
    qapCriteria,
    plant,
    product,
    createdBy,
    createdAt,
    status
  } = req.body;

  try {
    // Check if the customerId exists
    const [customerRows] = await db.query('SELECT id FROM customers WHERE id = ?', [customerId]);

    if (customerRows.length === 0) {
      return res.status(400).json({ error: 'Invalid customerId: Customer does not exist.' });
    }

    const sql = `
      INSERT INTO projects (
        id, customerId, title, details, startDate, endDate,
        inlineInspection, qapCriteria, plant, product,
        createdBy, createdAt, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      id, customerId, title, details, startDate, endDate,
      inlineInspection, qapCriteria, plant, product,
      createdBy, createdAt, status
    ]);

    res.status(201).json({ message: 'Project created successfully' });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

//getting customer details using customer id

router.get('/:customerId', async (req, res) => {
  const { customerId } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [customerId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//getting projects using customer id

router.get('/project/:customerId', async (req, res) => {
  const { customerId } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM projects WHERE customerId = ?', [customerId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all customers
router.get('/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers');
    res.status(200).json({ customers: rows });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});



module.exports = router;
