
# Hyderabad Metro Backend System

A comprehensive backend system for the Hyderabad Metro Route Finder application with advanced graph traversal algorithms and network management APIs.

## 🚀 Features

- **Network Management APIs**: Complete CRUD operations for metro lines and stations
- **Advanced Route Finding**: Multiple pathfinding algorithms (BFS, Dijkstra's, A*)
- **Fare Calculation**: Accurate fare calculation based on Hyderabad Metro rules
- **Time Estimation**: Real-time travel time calculation with interchange delays
- **RESTful APIs**: Comprehensive API endpoints with proper validation
- **Database Management**: SQLite database with proper relations and constraints

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Initialize Database

The database will be automatically created and initialized when you first run the server.

### Step 3: Seed Database with Hyderabad Metro Data

```bash
npm run seed
```

This will populate the database with:
- Red Line (Miyapur ↔ LB Nagar)
- Blue Line (Nagole ↔ Raidurg)  
- Green Line (JBS Parade Ground ↔ MGBS)
- All stations with proper interchange connections

### Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

### Health Check
```http
GET /health
```

### Line Management

#### Create Line
```http
POST /api/lines
Content-Type: application/json

{
  "name": "Purple Line",
  "color": "#8b5cf6",
  "route": "Shamshabad ↔ Kompally"
}
```

#### Get All Lines
```http
GET /api/lines
```

#### Get Specific Line
```http
GET /api/lines/{line_id}
```

#### Update Line
```http
PUT /api/lines/{line_id}
Content-Type: application/json

{
  "name": "Updated Line Name",
  "color": "#new-color"
}
```

#### Delete Line
```http
DELETE /api/lines/{line_id}
```

### Station Management

#### Add Station to Line
```http
POST /api/lines/{line_id}/stations
Content-Type: application/json

{
  "name": "New Station",
  "station_number": 15,
  "distance_from_previous": 1.8,
  "is_interchange": false
}
```

#### Get Stations by Line
```http
GET /api/lines/{line_id}/stations
```

#### Get All Stations
```http
GET /api/stations
```

### Route Finding

#### Find Optimal Route
```http
POST /api/route/find
Content-Type: application/json

{
  "source": "Miyapur",
  "destination": "Hi-Tec City"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "route": ["Miyapur", "JNTU College", "...", "Ameerpet", "...", "Hi-Tec City"],
    "totalStations": 19,
    "totalDistance": 27.0,
    "totalFare": 97,
    "interchanges": ["Ameerpet"],
    "estimatedTime": "50 minutes",
    "lineChanges": [
      {
        "from": "Red Line",
        "to": "Blue Line", 
        "at": "Ameerpet"
      }
    ],
    "fareBreakdown": {
      "baseFare": 10,
      "additionalFare": 85,
      "interchangePenalty": 2,
      "total": 97
    }
  }
}
```

#### Get Available Algorithms
```http
GET /api/route/algorithms
```

## 🧮 Algorithms Implemented

### 1. Breadth-First Search (BFS)
- **Use Case**: Unweighted shortest path (default)
- **Time Complexity**: O(V + E)
- **Best For**: Finding minimum number of stations

### 2. Dijkstra's Algorithm
- **Use Case**: Weighted shortest path
- **Time Complexity**: O(V²) or O((V + E) log V) with priority queue
- **Best For**: Distance-based optimization

### 3. A* Algorithm
- **Use Case**: Heuristic-based pathfinding
- **Time Complexity**: O(b^d) where b is branching factor
- **Best For**: Goal-directed search with heuristics

## 💰 Fare Calculation Rules

1. **Base Fare**: ₹10 for first 2 stations
2. **Additional Fare**: ₹5 per station after first 2
3. **Interchange Penalty**: ₹2 per line change

**Formula**: `Total = Base + (Additional Stations × 5) + (Interchanges × 2)`

## ⏱️ Time Calculation

**Formula**: `Time = (Stations - 1) × 2.5 minutes + Interchanges × 5 minutes`

- **Average per station**: 2.5 minutes
- **Interchange time**: 5 minutes additional

## 🗄️ Database Schema

### Lines Table
```sql
CREATE TABLE lines (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  route TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Stations Table
```sql
CREATE TABLE stations (
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
  FOREIGN KEY (line_id) REFERENCES lines (id) ON DELETE CASCADE
);
```

## 🧪 Testing

### Manual Testing Examples

1. **Test Route Finding**:
```bash
curl -X POST http://localhost:3001/api/route/find \
  -H "Content-Type: application/json" \
  -d '{"source": "Miyapur", "destination": "Hi-Tec City"}'
```

2. **Test Line Creation**:
```bash
curl -X POST http://localhost:3001/api/lines \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Line", "color": "#ff0000", "route": "A to B"}'
```

3. **Test Station Addition**:
```bash
curl -X POST http://localhost:3001/api/lines/{line_id}/stations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Station", "station_number": 1, "is_interchange": false}'
```

## 🚨 Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Station not found",
  "message": "Station 'Invalid Station' does not exist in the network"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate entries)
- `500`: Internal Server Error

## 📈 Performance Considerations

- **Graph Caching**: Network graph is built efficiently from database
- **Algorithm Selection**: BFS for most cases, Dijkstra's for weighted paths
- **Database Indexing**: Proper indexes on frequently queried fields
- **Connection Pooling**: SQLite with proper connection management

## 🔧 Configuration

Environment variables (optional):
```bash
PORT=3001                    # Server port
NODE_ENV=development        # Environment mode
DB_PATH=./data/metro.db     # Database file path
```

## 📝 Logs

The server provides comprehensive logging:
- Request/response logging with Morgan
- Error logging with stack traces
- Database operation logs
- Algorithm execution logs

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## 📄 License

MIT License - feel free to use this system for educational or commercial purposes.
