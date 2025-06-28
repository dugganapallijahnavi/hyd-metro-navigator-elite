
import { metroData } from './metroData';

export interface RouteResult {
  path: string[];
  interchanges: string[];
  lineChanges: Array<{
    from: string;
    to: string;
    at: string;
  }>;
  totalStations: number;
}

export interface FareResult {
  base: number;
  additional: number;
  interchangePenalty: number;
  total: number;
}

// BFS Algorithm for shortest path finding
export function findRoute(source: string, destination: string): RouteResult | null {
  if (source === destination) {
    return {
      path: [source],
      interchanges: [],
      lineChanges: [],
      totalStations: 1
    };
  }

  const queue: Array<{
    station: string;
    path: string[];
    visitedLines: Set<string>;
    interchanges: string[];
    lineChanges: Array<{ from: string; to: string; at: string }>;
  }> = [];

  const visited = new Set<string>();
  
  // Initialize with source station
  const sourceLine = metroData.getStationLine(source);
  if (!sourceLine) return null;
  
  queue.push({
    station: source,
    path: [source],
    visitedLines: new Set([sourceLine]),
    interchanges: [],
    lineChanges: []
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.station === destination) {
      return {
        path: current.path,
        interchanges: current.interchanges,
        lineChanges: current.lineChanges,
        totalStations: current.path.length
      };
    }

    if (visited.has(current.station)) continue;
    visited.add(current.station);

    // Get adjacent stations
    const adjacent = metroData.getAdjacentStations(current.station);
    
    for (const nextStation of adjacent) {
      if (visited.has(nextStation)) continue;

      const nextStationLine = metroData.getStationLine(nextStation);
      if (!nextStationLine) continue;

      const newPath = [...current.path, nextStation];
      const newVisitedLines = new Set(current.visitedLines);
      const newInterchanges = [...current.interchanges];
      const newLineChanges = [...current.lineChanges];

      // Check if this is a line change
      const currentStationLine = metroData.getStationLine(current.station);
      if (currentStationLine && currentStationLine !== nextStationLine) {
        if (!current.visitedLines.has(nextStationLine)) {
          newVisitedLines.add(nextStationLine);
          if (metroData.isInterchangeStation(current.station)) {
            newInterchanges.push(current.station);
            newLineChanges.push({
              from: currentStationLine,
              to: nextStationLine,
              at: current.station
            });
          }
        }
      }

      queue.push({
        station: nextStation,
        path: newPath,
        visitedLines: newVisitedLines,
        interchanges: newInterchanges,
        lineChanges: newLineChanges
      });
    }
  }

  return null;
}

export function calculateFare(route: RouteResult): FareResult {
  const totalStations = route.totalStations;
  const interchangeCount = route.interchanges.length;
  
  // Base fare for first 2 stations
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

export function calculateTime(route: RouteResult): number {
  const totalStations = route.totalStations;
  const interchangeCount = route.interchanges.length;
  
  // Time calculation: (stations - 1) * 2.5 minutes + interchanges * 5 minutes
  const travelTime = (totalStations - 1) * 2.5;
  const interchangeTime = interchangeCount * 5;
  
  return Math.round(travelTime + interchangeTime);
}

// API-like functions for management
export const MetroAPI = {
  // Lines Management
  createLine: (lineData: { name: string; color: string; route: string }) => {
    console.log('POST /api/lines - Creating line:', lineData);
    return { success: true, id: Date.now(), ...lineData };
  },

  getAllLines: () => {
    console.log('GET /api/lines - Fetching all lines');
    return metroData.getAllLines();
  },

  getLine: (lineId: string) => {
    console.log(`GET /api/lines/${lineId} - Fetching line details`);
    const lines = metroData.getAllLines();
    return lines.find(line => line.name === lineId);
  },

  updateLine: (lineId: string, updates: any) => {
    console.log(`PUT /api/lines/${lineId} - Updating line:`, updates);
    return { success: true, lineId, updates };
  },

  deleteLine: (lineId: string) => {
    console.log(`DELETE /api/lines/${lineId} - Deleting line`);
    return { success: true, lineId };
  },

  // Stations Management
  createStation: (lineId: string, stationData: any) => {
    console.log(`POST /api/lines/${lineId}/stations - Creating station:`, stationData);
    return { success: true, id: Date.now(), lineId, ...stationData };
  },

  getStationsByLine: (lineId: string) => {
    console.log(`GET /api/lines/${lineId}/stations - Fetching stations for line`);
    return metroData.getStationsByLine(lineId);
  },

  getAllStations: () => {
    console.log('GET /api/stations - Fetching all stations');
    return metroData.getAllStations();
  },

  // Route Finding
  findRoute: (source: string, destination: string) => {
    console.log(`POST /api/route/find - Finding route from ${source} to ${destination}`);
    const route = findRoute(source, destination);
    
    if (!route) {
      return { error: 'No route found between the specified stations' };
    }

    const fare = calculateFare(route);
    const time = calculateTime(route);

    return {
      route: route.path,
      totalStations: route.totalStations,
      totalDistance: (route.totalStations - 1) * 1.5, // Approximate distance
      totalFare: fare.total,
      interchanges: route.interchanges,
      estimatedTime: `${time} minutes`,
      lineChanges: route.lineChanges,
      fareBreakdown: fare
    };
  }
};
