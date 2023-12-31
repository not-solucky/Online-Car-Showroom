const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import JWT
const multer = require('multer');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const users = [
  { id: 1, name: 'John', email: 'admin@email.com', password: 'adminpass', role: 'admin' },
  { id: 2, name: 'Sarah', email: 'sarah@email.com', password: 'userpass', role: 'user' },
  { id: 3, name: 'James', email: 'james@email.com', password: 'userpass', role: 'user' },
];

// Configure multer to save uploaded images to a specific directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/image');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // You can customize the filename if needed
  }
});

const upload = multer({ storage: storage });
const secretKey = 'helloWorld'; // Set your secret key

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cars',
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization;


  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.userId = decoded.userId;
    next();
  });
}
function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization;
  console.log(token);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    if (decoded.role != 'admin') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

app.get('/api/dashboard', verifyToken, (req, res) => {
  const user = users.find((user) => user.id === req.userId);
  res.status(200).json({ message: 'Welcome to the dashboard', user });
});

app.post('/user/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email && user.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id, role: user.role,name:user.name }, secretKey, { expiresIn: '1h' });

  res.status(200).json({ message: 'Authentication successful', token });
});
app.post('/admin/addcar', verifyAdminToken,upload.single('image'), (req, res) => {
  const {brand,model,type,price,color,year,capacity} = req.body;
  connection.query('INSERT INTO CAR (brand,model,type,price,color,year,capacity,image) VALUES (?,?,?,?,?,?,?,?)', [brand,model,type,price,color,year,capacity,req.file.originalname], (err, rows) => {
    connection.release();

    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  console.log(req.body);
  console.log(req.file);
  res.status(200).json({ message: 'Car added successfully' });
});

app.get('/api/cars', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    connection.query('SELECT * FROM CAR', (err, rows) => {
      connection.release();

      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

