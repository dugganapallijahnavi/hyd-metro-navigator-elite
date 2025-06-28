
const Database = require('../database/database');
const { v4: uuidv4 } = require('uuid');

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  const db = new Database();
  
  try {
    // Initialize database
    await db.initialize();
    console.log('✅ Database initialized');

    // Create metro lines
    const redLineId = uuidv4();
    const blueLineId = uuidv4();
    const greenLineId = uuidv4();

    const lines = [
      {
        id: redLineId,
        name: 'Red Line',
        color: '#ef4444',
        route: 'Miyapur ↔ LB Nagar'
      },
      {
        id: blueLineId,
        name: 'Blue Line',
        color: '#3b82f6',
        route: 'Nagole ↔ Raidurg'
      },
      {
        id: greenLineId,
        name: 'Green Line',
        color: '#22c55e',
        route: 'JBS Parade Ground ↔ MGBS'
      }
    ];

    // Insert lines
    for (const line of lines) {
      await db.createLine(line);
      console.log(`✅ Created ${line.name}`);
    }

    // Red Line stations
    const redLineStations = [
      'Miyapur', 'JNTU College', 'KPHB Colony', 'Kukatpally', 'Balanagar',
      'Moosapet', 'Bharath Nagar', 'Erragadda', 'ESI Hospital', 'S R Nagar',
      'Ameerpet', 'Punjagutta', 'Irrum Manzil', 'Khairatabad', 'Lakdi-Ka-Pul',
      'Assembly', 'Nampally', 'Gandhi Bhavan', 'Osmania Medical College',
      'MG Bus Station', 'Malakpet', 'New Market', 'Musarambagh', 'Dilsukhnagar',
      'Chaitanyapuri', 'Victoria Memorial', 'LB Nagar'
    ];

    // Blue Line stations
    const blueLineStations = [
      'Nagole', 'Uppal', 'Stadium', 'NGRI', 'Habsiguda', 'Tarnaka',
      'Mettuguda', 'Secunderabad East', 'Parade Ground', 'Paradise',
      'Rasoolpura', 'Prakash Nagar', 'Begumpet', 'Ameerpet', 'Madhura Nagar',
      'Yusufguda', 'Jubilee Hills Checkpost', 'Jubilee Hills Road No. 5',
      'Jubilee Hills Road No. 1', 'Madhapur', 'Durgam Cheruvu', 'Hi-Tec City',
      'Raidurg'
    ];

    // Green Line stations
    const greenLineStations = [
      'JBS Parade Ground', 'Secunderabad West', 'Gandhi Hospital', 'Musheerabad',
      'RTC X Roads', 'Chikkadpally', 'Narayanguda', 'Sultan Bazar',
      'MG Bus Station', 'Osmania Medical College', 'Gandhi Bhavan',
      'Nampally', 'Assembly', 'Lakdi-Ka-Pul', 'Khairatabad', 'MGBS'
    ];

    // Interchange stations
    const interchangeStations = [
      'Ameerpet', 'Secunderabad East', 'Paradise', 'Begumpet',
      'MG Bus Station', 'Osmania Medical College', 'Gandhi Bhavan',
      'Nampally', 'Assembly', 'Lakdi-Ka-Pul', 'Khairatabad'
    ];

    // Insert Red Line stations
    for (let i = 0; i < redLineStations.length; i++) {
      const station = {
        id: uuidv4(),
        name: redLineStations[i],
        line_id: redLineId,
        station_number: i + 1,
        distance_from_previous: i === 0 ? 0 : 1.5,
        is_interchange: interchangeStations.includes(redLineStations[i])
      };
      await db.createStation(station);
    }
    console.log(`✅ Created ${redLineStations.length} Red Line stations`);

    // Insert Blue Line stations
    for (let i = 0; i < blueLineStations.length; i++) {
      const station = {
        id: uuidv4(),
        name: blueLineStations[i],
        line_id: blueLineId,
        station_number: i + 1,
        distance_from_previous: i === 0 ? 0 : 1.5,
        is_interchange: interchangeStations.includes(blueLineStations[i])
      };
      
      // Skip if station already exists (for interchange stations)
      try {
        await db.createStation(station);
      } catch (error) {
        if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
          throw error;
        }
      }
    }
    console.log(`✅ Created Blue Line stations`);

    // Insert Green Line stations
    for (let i = 0; i < greenLineStations.length; i++) {
      const station = {
        id: uuidv4(),
        name: greenLineStations[i],
        line_id: greenLineId,
        station_number: i + 1,
        distance_from_previous: i === 0 ? 0 : 1.5,
        is_interchange: interchangeStations.includes(greenLineStations[i])
      };
      
      // Skip if station already exists (for interchange stations)
      try {
        await db.createStation(station);
      } catch (error) {
        if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
          throw error;
        }
      }
    }
    console.log(`✅ Created Green Line stations`);

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
