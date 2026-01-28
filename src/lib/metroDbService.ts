import { supabase } from '@/integrations/supabase/client';

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  colorClass: string;
  route: string;
  stations: string[];
}

export interface Station {
  id: string;
  name: string;
  line: string;
  lineId: string;
  position: number;
  isInterchange: boolean;
  lineColor: string;
}

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

// Fetch all metro lines with their stations
export async function fetchAllLines(): Promise<MetroLine[]> {
  const { data: lines, error: linesError } = await supabase
    .from('metro_lines')
    .select('*')
    .order('name');

  if (linesError) throw linesError;

  const { data: stations, error: stationsError } = await supabase
    .from('metro_stations')
    .select('*')
    .order('position');

  if (stationsError) throw stationsError;

  return (lines || []).map(line => ({
    id: line.id,
    name: line.name,
    color: line.color,
    colorClass: line.color_class,
    route: line.route,
    stations: (stations || [])
      .filter(s => s.line_id === line.id)
      .sort((a, b) => a.position - b.position)
      .map(s => s.name)
  }));
}

// Fetch all stations with line information
export async function fetchAllStations(): Promise<Station[]> {
  const { data: stations, error: stationsError } = await supabase
    .from('metro_stations')
    .select(`
      *,
      metro_lines!inner (
        name,
        color_class
      )
    `)
    .order('name');

  if (stationsError) throw stationsError;

  return (stations || []).map(station => ({
    id: station.id,
    name: station.name,
    line: station.metro_lines.name,
    lineId: station.line_id,
    position: station.position,
    isInterchange: station.is_interchange,
    lineColor: station.metro_lines.color_class
  }));
}

// Get unique station names (for dropdowns)
export async function fetchUniqueStationNames(): Promise<string[]> {
  const { data: stations, error } = await supabase
    .from('metro_stations')
    .select('name')
    .order('name');

  if (error) throw error;

  // Get unique names
  const uniqueNames = [...new Set((stations || []).map(s => s.name))];
  return uniqueNames.sort();
}

// Build adjacency graph for pathfinding
async function buildGraph(): Promise<Map<string, Set<string>>> {
  const lines = await fetchAllLines();
  const graph = new Map<string, Set<string>>();

  for (const line of lines) {
    for (let i = 0; i < line.stations.length; i++) {
      const station = line.stations[i];
      if (!graph.has(station)) {
        graph.set(station, new Set());
      }

      // Add adjacent stations on same line
      if (i > 0) {
        graph.get(station)!.add(line.stations[i - 1]);
      }
      if (i < line.stations.length - 1) {
        graph.get(station)!.add(line.stations[i + 1]);
      }
    }
  }

  return graph;
}

// Get station's line from database
async function getStationLine(stationName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('metro_stations')
    .select('metro_lines!inner(name)')
    .eq('name', stationName)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0].metro_lines.name;
}

// Check if station is an interchange
async function isInterchangeStation(stationName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('metro_stations')
    .select('is_interchange')
    .eq('name', stationName)
    .eq('is_interchange', true)
    .limit(1);

  if (error) return false;
  return (data && data.length > 0);
}

// BFS Algorithm for shortest path finding
export async function findRoute(source: string, destination: string): Promise<RouteResult | null> {
  if (source === destination) {
    return {
      path: [source],
      interchanges: [],
      lineChanges: [],
      totalStations: 1
    };
  }

  const graph = await buildGraph();
  const lines = await fetchAllLines();

  // Helper to get line for a station
  const getLineForStation = (stationName: string): string | null => {
    for (const line of lines) {
      if (line.stations.includes(stationName)) {
        return line.name;
      }
    }
    return null;
  };

  // Helper to check if interchange
  const checkInterchange = async (stationName: string): Promise<boolean> => {
    return await isInterchangeStation(stationName);
  };

  const queue: Array<{
    station: string;
    path: string[];
    visitedLines: Set<string>;
    interchanges: string[];
    lineChanges: Array<{ from: string; to: string; at: string }>;
  }> = [];

  const visited = new Set<string>();

  const sourceLine = getLineForStation(source);
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

    const adjacent = graph.get(current.station) || new Set();

    for (const nextStation of adjacent) {
      if (visited.has(nextStation)) continue;

      const nextStationLine = getLineForStation(nextStation);
      if (!nextStationLine) continue;

      const newPath = [...current.path, nextStation];
      const newVisitedLines = new Set(current.visitedLines);
      const newInterchanges = [...current.interchanges];
      const newLineChanges = [...current.lineChanges];

      const currentStationLine = getLineForStation(current.station);
      if (currentStationLine && currentStationLine !== nextStationLine) {
        if (!current.visitedLines.has(nextStationLine)) {
          newVisitedLines.add(nextStationLine);
          const isInterchange = await checkInterchange(current.station);
          if (isInterchange) {
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

// Calculate fare based on route
export function calculateFare(route: RouteResult): FareResult {
  const totalStations = route.totalStations;
  const interchangeCount = route.interchanges.length;

  const baseFare = 10;
  const additionalStations = Math.max(0, totalStations - 2);
  const additionalFare = additionalStations * 5;
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
export function calculateTime(route: RouteResult): number {
  const totalStations = route.totalStations;
  const interchangeCount = route.interchanges.length;
  const travelTime = (totalStations - 1) * 2.5;
  const interchangeTime = interchangeCount * 5;
  return Math.round(travelTime + interchangeTime);
}

// CRUD Operations for admin
export async function createLine(name: string, color: string, colorClass: string, route: string) {
  const { data, error } = await supabase
    .from('metro_lines')
    .insert({ name, color, color_class: colorClass, route })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createStation(name: string, lineId: string, position: number, isInterchange: boolean) {
  const { data, error } = await supabase
    .from('metro_stations')
    .insert({ name, line_id: lineId, position, is_interchange: isInterchange })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLine(id: string) {
  const { error } = await supabase
    .from('metro_lines')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteStation(id: string) {
  const { error } = await supabase
    .from('metro_stations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
