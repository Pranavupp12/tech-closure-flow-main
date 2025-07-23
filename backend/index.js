const express = require('express');
const app = express();
var cors =require('cors');

app.use(cors())
app.use(express.json());

app.use('/api/auth',require('./routes/auth'));
app.use('/api/sales',require('./routes/sales'));
app.use('/api/tasks',require('./routes/tasks'));
app.use('/api/response',require('./routes/response'));
app.use('/api/review',require('./routes/review'));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
