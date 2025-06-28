
class RouteService {
  constructor(graph) {
    this.graph = graph;
  }

  // BFS Algorithm for shortest path (unweighted)
  findShortestPath(source, destination) {
    if (!this.graph[source] || !this.graph[destination]) {
      return null;
    }

    const queue = [{ station: source, path: [source], interchanges: [] }];
    const visited = new Set();

    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current.station === destination) {
        return {
          path: current.path,
          interchanges: current.interchanges,
          distance: current.path.length - 1
        };
      }

      if (visited.has(current.station)) continue;
      visited.add(current.station);

      const neighbors = this.graph[current.station].connections;
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.station)) {
          const newPath = [...current.path, neighbor.station];
          let newInterchanges = [...current.interchanges];

          // Check if this is an interchange
          if (this.graph[current.station].isInterchange && 
              current.path.length > 1 && 
              this.isLineChange(current.path[current.path.length - 2], current.station, neighbor.station)) {
            if (!newInterchanges.includes(current.station)) {
              newInterchanges.push(current.station);
            }
          }

          queue.push({
            station: neighbor.station,
            path: newPath,
            interchanges: newInterchanges
          });
        }
      }
    }

    return null;
  }

  // Dijkstra's Algorithm for weighted shortest path
  findShortestPathDijkstra(source, destination) {
    if (!this.graph[source] || !this.graph[destination]) {
      return null;
    }

    const distances = {};
    const previous = {};
    const visited = new Set();
    const queue = [];

    // Initialize distances
    Object.keys(this.graph).forEach(station => {
      distances[station] = station === source ? 0 : Infinity;
      previous[station] = null;
    });

    queue.push({ station: source, distance: 0 });

    while (queue.length > 0) {
      // Get station with minimum distance
      queue.sort((a, b) => a.distance - b.distance);
      const current = queue.shift();

      if (visited.has(current.station)) continue;
      visited.add(current.station);

      if (current.station === destination) break;

      const neighbors = this.graph[current.station].connections;
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.station)) {
          const newDistance = distances[current.station] + (neighbor.weight || 1);
          
          if (newDistance < distances[neighbor.station]) {
            distances[neighbor.station] = newDistance;
            previous[neighbor.station] = current.station;
            queue.push({ station: neighbor.station, distance: newDistance });
          }
        }
      }
    }

    // Reconstruct path
    const path = [];
    let currentStation = destination;
    
    while (currentStation !== null) {
      path.unshift(currentStation);
      currentStation = previous[currentStation];
    }

    if (path[0] !== source) return null;

    // Find interchanges
    const interchanges = [];
    for (let i = 1; i < path.length - 1; i++) {
      if (this.graph[path[i]].isInterchange) {
        if (this.isLineChange(path[i-1], path[i], path[i+1])) {
          interchanges.push(path[i]);
        }
      }
    }

    return {
      path,
      interchanges,
      distance: distances[destination]
    };
  }

  // A* Algorithm (requires heuristic function)
  findShortestPathAStar(source, destination, heuristic = null) {
    if (!this.graph[source] || !this.graph[destination]) {
      return null;
    }

    // Default heuristic (Manhattan distance approximation)
    const defaultHeuristic = (station1, station2) => {
      // Simple heuristic based on station name similarity
      return Math.abs(station1.length - station2.length);
    };

    const h = heuristic || defaultHeuristic;
    
    const openSet = [{ station: source, f: 0, g: 0, path: [source] }];
    const closedSet = new Set();
    const gScore = { [source]: 0 };
    const fScore = { [source]: h(source, destination) };

    while (openSet.length > 0) {
      // Get node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();

      if (current.station === destination) {
        // Find interchanges
        const interchanges = [];
        for (let i = 1; i < current.path.length - 1; i++) {
          if (this.graph[current.path[i]].isInterchange) {
            if (this.isLineChange(current.path[i-1], current.path[i], current.path[i+1])) {
              interchanges.push(current.path[i]);
            }
          }
        }

        return {
          path: current.path,
          interchanges,
          distance: current.g
        };
      }

      closedSet.add(current.station);

      const neighbors = this.graph[current.station].connections;
      
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor.station)) continue;

        const tentativeG = gScore[current.station] + (neighbor.weight || 1);

        if (!gScore[neighbor.station] || tentativeG < gScore[neighbor.station]) {
          gScore[neighbor.station] = tentativeG;
          fScore[neighbor.station] = tentativeG + h(neighbor.station, destination);

          const existingIndex = openSet.findIndex(item => item.station === neighbor.station);
          const newItem = {
            station: neighbor.station,
            f: fScore[neighbor.station],
            g: tentativeG,
            path: [...current.path, neighbor.station]
          };

          if (existingIndex >= 0) {
            openSet[existingIndex] = newItem;
          } else {
            openSet.push(newItem);
          }
        }
      }
    }

    return null;
  }

  // Check if there's a line change between three consecutive stations
  isLineChange(station1, station2, station3) {
    const lines1 = this.graph[station1].lines;
    const lines2 = this.graph[station2].lines;
    const lines3 = this.graph[station3].lines;

    // Find common line between station1 and station2
    const commonLines12 = lines1.filter(line => lines2.includes(line));
    // Find common line between station2 and station3
    const commonLines23 = lines2.filter(line => lines3.includes(line));

    // If there's no common line between the segments, it's a line change
    return commonLines12.length === 0 || commonLines23.length === 0 || 
           !commonLines12.some(line => commonLines23.includes(line));
  }

  // Calculate fare based on Hyderabad Metro rules
  calculateFare(route) {
    const totalStations = route.path.length;
    const interchangeCount = route.interchanges.length;

    // Base fare for first 2 stations: ₹10
    const baseFare = 10;
    
    // Additional fare: ₹5 per station after the first 2
    const additionalStations = Math.max(0, totalStations - 2);
    const additionalFare = additionalStations * 5;
    
    // Interchange penalty: ₹2 per line change
    const interchangePenalty = interchangeCount * 2;
    
    const total = baseFare + additionalFare + interchangePenalty;

    return {
      base: baseFare,
      additional: additionalFare,
      interchangePenalty,
      total
    };
  }

  // Calculate estimated travel time
  calculateTravelTime(route) {
    const totalStations = route.path.length;
    const interchangeCount = route.interchanges.length;

    // Time calculation: (stations - 1) * 2.5 minutes + interchanges * 5 minutes
    const travelTime = (totalStations - 1) * 2.5;
    const interchangeTime = interchangeCount * 5;

    return Math.round(travelTime + interchangeTime);
  }

  // Get detailed line changes information
  getLineChanges(route, graph) {
    const lineChanges = [];
    const path = route.path;

    for (let i = 1; i < path.length - 1; i++) {
      if (graph[path[i]].isInterchange) {
        if (this.isLineChange(path[i-1], path[i], path[i+1])) {
          // Determine which lines are involved
          const prevLines = graph[path[i-1]].lines;
          const currentLines = graph[path[i]].lines;
          const nextLines = graph[path[i+1]].lines;

          const fromLine = prevLines.find(line => currentLines.includes(line));
          const toLine = nextLines.find(line => currentLines.includes(line));

          if (fromLine && toLine && fromLine !== toLine) {
            lineChanges.push({
              from: fromLine,
              to: toLine,
              at: path[i]
            });
          }
        }
      }
    }

    return lineChanges;
  }
}

module.exports = RouteService;
