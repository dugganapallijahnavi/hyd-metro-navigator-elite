
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const router = express.Router();

// Validation schemas
const stationSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  station_number: Joi.number().integer().min(1).required(),
  distance_from_previous: Joi.number().min(0).default(1.5),
  is_interchange: Joi.boolean().default(false)
});

// POST /api/lines/:line_id/stations - Add a new station to a specific line
router.post('/:line_id/stations', async (req, res) => {
  try {
    const { line_id } = req.params;
    console.log(`POST /api/lines/${line_id}/stations - Creating station:`, req.body);
    
    // Validate line exists
    const line = await req.db.getLineById(line_id);
    if (!line) {
      return res.status(404).json({
        error: 'Line not found',
        message: `Line with id ${line_id} does not exist`
      });
    }

    const { error, value } = stationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const stationData = {
      id: uuidv4(),
      line_id,
      ...value
    };

    const result = await req.db.createStation(stationData);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Station created successfully'
    });
  } catch (error) {
    console.error('Error creating station:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({
        error: 'Station already exists',
        message: 'A station with this name or number already exists on this line'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create station'
      });
    }
  }
});

// GET /api/lines/:line_id/stations - List all stations on a specific line
router.get('/:line_id/stations', async (req, res) => {
  try {
    const { line_id } = req.params;
    console.log(`GET /api/lines/${line_id}/stations - Fetching stations for line`);
    
    // Validate line exists
    const line = await req.db.getLineById(line_id);
    if (!line) {
      return res.status(404).json({
        error: 'Line not found',
        message: `Line with id ${line_id} does not exist`
      });
    }

    const stations = await req.db.getStationsByLine(line_id);
    
    res.json({
      success: true,
      data: stations,
      count: stations.length,
      line: line.name
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch stations'
    });
  }
});

// GET /api/stations - List all stations across the entire network
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/stations - Fetching all stations');
    
    const stations = await req.db.getAllStations();
    
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    console.error('Error fetching all stations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch stations'
    });
  }
});

module.exports = router;
