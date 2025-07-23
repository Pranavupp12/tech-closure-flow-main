const express = require('express');
const router = express.Router();
const db = require('../database');

// creating task and storing information in sql

router.post('/createtask', async (req, res) => {
  let {
    id,
    projectId,
    title,
    description,
    dueDate,
    status,
    assignees,
    createdBy,
    createdAt
  } = req.body;

  function formatToMySQLDatetime(isoString) {
  const date = new Date(isoString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

  try {

    dueDate = formatToMySQLDatetime(dueDate);
    createdAt = formatToMySQLDatetime(createdAt);

     if (!Array.isArray(assignees)) {
      try {
        assignees = JSON.parse(assignees);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid assignees format. Must be a JSON array.' });
      }
    }

    // Check if project exists
    const [projectRows] = await db.query('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (projectRows.length === 0) {
      return res.status(400).json({ error: 'Invalid projectId: Project does not exist.' });
    }

    // Insert task into DB
    const sql = `
      INSERT INTO tasks (
        id, projectId, title, description, dueDate, status,
        assignees, createdBy, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      id,
      projectId,
      title,
      description,
      dueDate,
      status,
      JSON.stringify(assignees), // convert array to JSON string
      createdBy,
      createdAt
    ]);

    res.status(201).json({ message: 'Task created successfully' });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});


//get all tasks
router.get("/alltasks", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks");
    res.json({ tasks: rows });
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});


// Get tasks based on a list of task IDs
router.get('/tasks', async (req, res) => {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: 'Task IDs are required' });
  }

  const idList = ids.split(',');

  try {
    const [rows] = await db.query(
      `SELECT * FROM tasks WHERE id IN (${idList.map(() => '?').join(',')})`,
      idList
    );
    res.status(200).json({ tasks: rows });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects');
    res.status(200).json({ projects: rows });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

//getting tasks to display by using project id
router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE projectId = ?', [projectId]);

    const tasks = rows.map(task => ({
      ...task,
      assignees: Array.isArray(task.assignees)
        ? task.assignees
        : (() => {
            try {
              return JSON.parse(task.assignees || '[]');
            } catch (e) {
              console.warn(`Invalid assignees JSON for task ${task.id}:`, task.assignees);
              return [];
            }
          })(),
      attachments: (() => {
        try {
          return task.attachments ? JSON.parse(task.attachments) : [];
        } catch (e) {
          console.warn(`Invalid attachments JSON for task ${task.id}:`, task.attachments);
          return [];
        }
      })()
    }));

    res.json({ tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});



// fetching project details by project id
router.get('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [projectId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ project: rows[0] });
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// display task info by task id
router.get('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  console.log('Fetching task for ID:', req.params.taskId);

  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = rows[0];

    // Parse JSON fields
     try {
      const parsed = JSON.parse(task.assignees || '[]');
      task.assignees = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.warn(`Failed to parse assignees for task ${task.id}:`, task.assignees);
      task.assignees = [];
    }
    try {
      task.attachments = task.attachments ? JSON.parse(task.attachments) : [];
    } catch (e) {
      console.warn(`Failed to parse attachments for task ${task.id}:`, task.attachments);
      task.attachments = [];
    }

    res.status(200).json({ task });
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

//getting tasks for specific assignee
router.get('/assignee/:userId', async (req, res) => {

function safeParseAssignees(raw) {
  try {
    // If already an array (from MySQL), return as-is
    if (Array.isArray(raw)) return raw;

    // If it's a string, try to parse it
    if (typeof raw === "string") {
      const parsed = JSON.parse(raw);

      // If stringified array inside a string
      if (typeof parsed === "string" && parsed.startsWith("[") && parsed.endsWith("]")) {
        return JSON.parse(parsed); // Double-encoded
      }

      return Array.isArray(parsed) ? parsed : [];
    }

    return [];
  } catch (e) {
    console.warn("Failed to parse assignees:", raw);
    return [];
  }
}


  const { userId } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM tasks');

    const tasks = rows.filter(task => {
      const assignees = safeParseAssignees(task.assignees);
      return assignees.map(String).includes(String(userId));
    });

    res.json({ tasks });
  } catch (err) {
    console.error("Error fetching tasks for assignee:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});
// getting tasks from taskid
router.get("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  try {
    const [result] = await db.query("SELECT * FROM tasks WHERE id = ?", [taskId]);
    res.json(result[0]); // return single task
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

//update task status
router.put('/:id', async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  try {
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
    res.status(200).json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

//update project status

router.put('/:id', async (req, res) => {
  const projectId = req.params.id;
  const { status } = req.body;

  try {
    await db.query('UPDATE projects SET status = ? WHERE id = ?', [status, projectId]);
    res.status(200).json({ message: 'Project updated successfully' });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});




module.exports = router;

