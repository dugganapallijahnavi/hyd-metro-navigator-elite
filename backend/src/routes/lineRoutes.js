
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const router = express.Router();

// Validation schemas
const lineSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  color: Joi.string().required().min(1).max(50),
  route: Joi.string().required().min(1).max(200)
});

const updateLineSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  color: Joi.string().min(1).max(50),
  route: Joi.string().min(1).max(200)
}).min(1);

// POST /api/lines - Create a new metro line
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/lines - Creating line:', req.body);
    
    const { error, value } = lineSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const lineData = {
      id: uuidv4(),
      ...value
    };

    const result = await req.db.createLine(lineData);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Line created successfully'
    });
  } catch (error) {
    console.error('Error creating line:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({
        error: 'Line already exists',
        message: 'A line with this name already exists'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create line'
      });
    }
  }
});

// GET /api/lines - List all metro lines
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/lines - Fetching all lines');
    
    const lines = await req.db.getAllLines();
    
    res.json({
      success: true,
      data: lines,
      count: lines.length
    });
  } catch (error) {
    console.error('Error fetching lines:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch lines'
    });
  }
});

// GET /api/lines/:line_id - Get details of a specific line
router.get('/:line_id', async (req, res) => {
  try {
    const { line_id } = req.params;
    console.log(`GET /api/lines/${line_id} - Fetching line details`);
    
    const line = await req.db.getLineById(line_id);
    
    if (!line) {
      return res.status(404).json({
        error: 'Line not found',
        message: `Line with id ${line_id} does not exist`
      });
    }

    // Get stations for this line
    const stations = await req.db.getStationsByLine(line_id);
    
    res.json({
      success: true,
      data: {
        ...line,
        stations: stations
      }
    });
  } catch (error) {
    console.error('Error fetching line:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch line details'
    });
  }
});

// PUT /api/lines/:line_id - Update a line's details
router.put('/:line_id', async (req, res) => {
  try {
    const { line_id } = req.params;
    console.log(`PUT /api/lines/${line_id} - Updating line:`, req.body);
    
    const { error, value } = updateLineSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    // Check if line exists
    const existingLine = await req.db.getLineById(line_id);
    if (!existingLine) {
      return res.status(404).json({
        error: 'Line not found',
        message: `Line with id ${line_id} does not exist`
      });
    }

    const result = await req.db.updateLine(line_id, value);
    
    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Line not found',
        message: `Line with id ${line_id} does not exist`
      });
    }

    res.json({
      success: true,
      message: 'Line updated successfully',
      data: { id: line_id, ...value }
    });
  } catch (error) {
    console.error('Error updating line:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({
        error: 'Line name already exists',
        message: 'A line with this name already exists'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to update line'
      });
    }
  }
});

// DELETE /api/lines/:line_id - Delete a line
router.delete('/:line_id', async (req, res) => {
  try {
    const { line_id } = req.params;
    console.log(`DELETE /api/lines/${line_id} - Deleting line`);
    
    const result = await req.db.deleteLine(line_id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Line not found',
        message: `Line with id ${line_id} does not exist`
      });
    }

    res.json({
      success: true,
      message: 'Line deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting line:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete line'
    });
  }
});

module.exports = router;
