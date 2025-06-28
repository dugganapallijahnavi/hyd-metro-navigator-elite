
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../data/metro.db'));
    this.db.run('PRAGMA foreign_keys = ON');
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create Lines table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS lines (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            color TEXT NOT NULL,
            route TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create Stations table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS stations (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            line_id TEXT NOT NULL,
            station_number INTEGER NOT NULL,
            distance_from_previous REAL DEFAULT 1.5,
            is_interchange BOOLEAN DEFAULT 0,
            latitude REAL,
            longitude REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (line_id) REFERENCES lines (id) ON DELETE CASCADE,
            UNIQUE(line_id, station_number)
          )
        `);

        // Create Interchange Connections table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS interchange_connections (
            id TEXT PRIMARY KEY,
            station_name TEXT NOT NULL,
            line1_id TEXT NOT NULL,
            line2_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (line1_id) REFERENCES lines (id) ON DELETE CASCADE,
            FOREIGN KEY (line2_id) REFERENCES lines (id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // Line operations
  async createLine(lineData) {
    return new Promise((resolve, reject) => {
      const { id, name, color, route } = lineData;
      this.db.run(
        'INSERT INTO lines (id, name, color, route) VALUES (?, ?, ?, ?)',
        [id, name, color, route],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...lineData });
        }
      );
    });
  }

  async getAllLines() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM lines ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getLineById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM lines WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateLine(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      
      this.db.run(
        `UPDATE lines SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  async deleteLine(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM lines WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  // Station operations
  async createStation(stationData) {
    return new Promise((resolve, reject) => {
      const { id, name, line_id, station_number, distance_from_previous, is_interchange } = stationData;
      this.db.run(
        'INSERT INTO stations (id, name, line_id, station_number, distance_from_previous, is_interchange) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, line_id, station_number, distance_from_previous || 1.5, is_interchange || 0],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...stationData });
        }
      );
    });
  }

  async getAllStations() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT s.*, l.name as line_name, l.color as line_color
        FROM stations s
        JOIN lines l ON s.line_id = l.id
        ORDER BY s.name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getStationsByLine(lineId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM stations WHERE line_id = ? ORDER BY station_number',
        [lineId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getStationByName(name) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT s.*, l.name as line_name FROM stations s JOIN lines l ON s.line_id = l.id WHERE s.name = ?',
        [name],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Get network graph for pathfinding
  async getNetworkGraph() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT s.name, s.line_id, l.name as line_name, s.station_number, s.is_interchange
        FROM stations s
        JOIN lines l ON s.line_id = l.id
        ORDER BY l.name, s.station_number
      `, (err, stations) => {
        if (err) {
          reject(err);
          return;
        }

        // Build adjacency list
        const graph = {};
        const lineStations = {};

        // Group stations by line
        stations.forEach(station => {
          if (!lineStations[station.line_id]) {
            lineStations[station.line_id] = [];
          }
          lineStations[station.line_id].push(station);
          
          if (!graph[station.name]) {
            graph[station.name] = {
              connections: [],
              lines: [station.line_name],
              isInterchange: !!station.is_interchange
            };
          }
        });

        // Add connections within each line
        Object.values(lineStations).forEach(lineStationList => {
          for (let i = 0; i < lineStationList.length - 1; i++) {
            const current = lineStationList[i];
            const next = lineStationList[i + 1];
            
            graph[current.name].connections.push({
              station: next.name,
              line: current.line_name,
              weight: 1
            });
            
            graph[next.name].connections.push({
              station: current.name,
              line: current.line_name,
              weight: 1
            });
          }
        });

        // Add interchange connections
        const interchangeStations = stations.filter(s => s.is_interchange);
        const stationLines = {};
        
        stations.forEach(station => {
          if (!stationLines[station.name]) {
            stationLines[station.name] = [];
          }
          stationLines[station.name].push(station.line_name);
        });

        // Update graph with multiple lines for interchange stations
        Object.keys(stationLines).forEach(stationName => {
          if (stationLines[stationName].length > 1) {
            graph[stationName].lines = stationLines[stationName];
            graph[stationName].isInterchange = true;
          }
        });

        resolve(graph);
      });
    });
  }
}

module.exports = Database;
