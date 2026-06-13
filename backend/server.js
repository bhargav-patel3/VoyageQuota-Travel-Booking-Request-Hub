import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'voyage_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create database connection pool
console.log(`Connecting to database at ${dbConfig.host}:${dbConfig.port}...`);
const pool = mysql.createPool(dbConfig);

// Health check endpoint (for DevOps liveness/readiness probes)
app.get('/health', async (req, res) => {
  try {
    // Attempt to query the database to verify connectivity
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        server: 'OK',
        database: 'CONNECTED'
      }
    });
  } catch (error) {
    const errMsg = error.message || error.code || String(error);
    console.error('Healthcheck database connection failed:', errMsg);
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        server: 'OK',
        database: 'DISCONNECTED'
      },
      error: errMsg
    });
  }
});

// GET: Fetch all travel booking requests
app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM booking_requests ORDER BY created_at DESC');
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking requests. Please check if the database is running.',
      error: error.message
    });
  }
});

// POST: Create a new travel booking request
app.post('/api/bookings', async (req, res) => {
  const { passenger_names, from_location, to_location, travel_date, special_notes } = req.body;

  // Validation
  if (!passenger_names || !from_location || !to_location || !travel_date) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: passenger_names, from_location, to_location, and travel_date are required.'
    });
  }

  try {
    const query = `
      INSERT INTO booking_requests (passenger_names, from_location, to_location, travel_date, special_notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      passenger_names,
      from_location,
      to_location,
      travel_date,
      special_notes || null
    ]);

    const [newBooking] = await pool.query('SELECT * FROM booking_requests WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully.',
      data: newBooking[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking request. Please check if the database is running.',
      error: error.message
    });
  }
});

// Root message
app.get('/', (req, res) => {
  res.send('VoyageQuota Travel Request API is running. Access endpoints at /api/bookings or /health.');
});

// Start the server
app.listen(port, () => {
  console.log(`VoyageQuota Backend running on port ${port}`);
});
