
const express = require('express');
const Joi = require('joi');
const RouteService = require('../services/routeService');
const router = express.Router();

// Validation schema
const routeRequestSchema = Joi.object({
  source: Joi.string().required().min(1).max(100),
  destination: Joi.string().required().min(1).max(100)
});

// POST /api/route/find - Find the optimal route between two stations
router.post('/find', async (req, res) => {
  try {
    console.log(`POST /api/route/find - Finding route from ${req.body.source} to ${req.body.destination}`);
    
    const { error, value } = routeRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const { source, destination } = value;

    // Check if source and destination are the same
    if (source === destination) {
      return res.json({
        success: true,
        data: {
          route: [source],
          totalStations: 1,
          totalDistance: 0,
          totalFare: 0,
          interchanges: [],
          estimatedTime: "0 minutes",
          lineChanges: []
        }
      });
    }

    // Validate stations exist
    const sourceStation = await req.db.getStationByName(source);
    const destStation = await req.db.getStationByName(destination);

    if (!sourceStation) {
      return res.status(404).json({
        error: 'Source station not found',
        message: `Station '${source}' does not exist in the network`
      });
    }

    if (!destStation) {
      return res.status(404).json({
        error: 'Destination station not found',
        message: `Station '${destination}' does not exist in the network`
      });
    }

    // Get network graph
    const graph = await req.db.getNetworkGraph();
    
    // Initialize route service
    const routeService = new RouteService(graph);
    
    // Find optimal route using BFS
    const route = routeService.findShortestPath(source, destination);
    
    if (!route) {
      return res.status(404).json({
        error: 'No route found',
        message: `No route exists between '${source}' and '${destination}'`
      });
    }

    // Calculate fare and time
    const fareDetails = routeService.calculateFare(route);
    const estimatedTime = routeService.calculateTravelTime(route);
    const lineChanges = routeService.getLineChanges(route, graph);

    const response = {
      success: true,
      data: {
        route: route.path,
        totalStations: route.path.length,
        totalDistance: (route.path.length - 1) * 1.5, // Average 1.5km per station
        totalFare: fareDetails.total,
        interchanges: route.interchanges,
        estimatedTime: `${estimatedTime} minutes`,
        lineChanges: lineChanges,
        fareBreakdown: {
          baseFare: fareDetails.base,
          additionalFare: fareDetails.additional,
          interchangePenalty: fareDetails.interchangePenalty,
          total: fareDetails.total
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error finding route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to find route'
    });
  }
});

// GET /api/route/algorithms - Get available pathfinding algorithms
router.get('/algorithms', (req, res) => {
  res.json({
    success: true,
    data: {
      available: ['BFS', 'Dijkstra', 'A*'],
      default: 'BFS',
      description: {
        'BFS': 'Breadth-First Search - finds shortest path in unweighted graphs',
        'Dijkstra': 'Dijkstra\'s algorithm - finds shortest path in weighted graphs',
        'A*': 'A* algorithm - heuristic-based pathfinding (requires coordinates)'
      }
    }
  });
});

module.exports = router;
