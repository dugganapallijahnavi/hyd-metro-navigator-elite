
// Hyderabad Metro Network Data Structure
export interface Station {
  name: string;
  line: string;
  position: number;
  isInterchange: boolean;
  interchangeLines?: string[];
  lineColor: string;
}

export interface MetroLine {
  name: string;
  color: string;
  colorClass: string;
  stations: string[];
  route: string;
}

class MetroDataService {
  private redLineStations = [
    'Miyapur', 'JNTU College', 'KPHB Colony', 'Kukatpally', 'Balanagar',
    'Moosapet', 'Bharath Nagar', 'Erragadda', 'ESI Hospital', 'S R Nagar',
    'Ameerpet', 'Punjagutta', 'Irrum Manzil', 'Khairatabad', 'Lakdi-Ka-Pul',
    'Assembly', 'Nampally', 'Gandhi Bhavan', 'Osmania Medical College',
    'MG Bus Station', 'Malakpet', 'New Market', 'Musarambagh', 'Dilsukhnagar',
    'Chaitanyapuri', 'Victoria Memorial', 'LB Nagar'
  ];

  private blueLineStations = [
    'Nagole', 'Uppal', 'Stadium', 'NGRI', 'Habsiguda', 'Tarnaka',
    'Mettuguda', 'Secunderabad East', 'Parade Ground', 'Paradise',
    'Rasoolpura', 'Prakash Nagar', 'Begumpet', 'Ameerpet', 'Madhura Nagar',
    'Yusufguda', 'Jubilee Hills Checkpost', 'Jubilee Hills Road No. 5',
    'Jubilee Hills Road No. 1', 'Madhapur', 'Durgam Cheruvu', 'Hi-Tec City',
    'Raidurg'
  ];

  private greenLineStations = [
    'JBS Parade Ground', 'Secunderabad West', 'Gandhi Hospital', 'Musheerabad',
    'RTC X Roads', 'Chikkadpally', 'Narayanguda', 'Sultan Bazar',
    'MG Bus Station', 'Osmania Medical College', 'Gandhi Bhavan',
    'Nampally', 'Assembly', 'Lakdi-Ka-Pul', 'Khairatabad', 'MGBS'
  ];

  private interchangeStations = [
    'Ameerpet', 'Secunderabad East', 'Paradise', 'Begumpet',
    'MG Bus Station', 'Osmania Medical College', 'Gandhi Bhavan',
    'Nampally', 'Assembly', 'Lakdi-Ka-Pul', 'Khairatabad'
  ];

  getAllLines(): MetroLine[] {
    return [
      {
        name: 'Red Line',
        color: 'red',
        colorClass: 'bg-red-500',
        stations: this.redLineStations,
        route: 'Miyapur ↔ LB Nagar'
      },
      {
        name: 'Blue Line',
        color: 'blue',
        colorClass: 'bg-blue-500',
        stations: this.blueLineStations,
        route: 'Nagole ↔ Raidurg'
      },
      {
        name: 'Green Line',
        color: 'green',
        colorClass: 'bg-green-500',
        stations: this.greenLineStations,
        route: 'JBS Parade Ground ↔ MGBS'
      }
    ];
  }

  getAllStations(): Station[] {
    const stations: Station[] = [];
    
    // Add Red Line stations
    this.redLineStations.forEach((station, index) => {
      stations.push({
        name: station,
        line: 'Red Line',
        position: index,
        isInterchange: this.interchangeStations.includes(station),
        lineColor: 'bg-red-500',
        interchangeLines: this.getInterchangeLines(station)
      });
    });

    // Add Blue Line stations
    this.blueLineStations.forEach((station, index) => {
      if (!stations.find(s => s.name === station)) {
        stations.push({
          name: station,
          line: 'Blue Line',
          position: index,
          isInterchange: this.interchangeStations.includes(station),
          lineColor: 'bg-blue-500',
          interchangeLines: this.getInterchangeLines(station)
        });
      }
    });

    // Add Green Line stations
    this.greenLineStations.forEach((station, index) => {
      if (!stations.find(s => s.name === station)) {
        stations.push({
          name: station,
          line: 'Green Line',
          position: index,
          isInterchange: this.interchangeStations.includes(station),
          lineColor: 'bg-green-500',
          interchangeLines: this.getInterchangeLines(station)
        });
      }
    });

    return stations.sort((a, b) => a.name.localeCompare(b.name));
  }

  private getInterchangeLines(station: string): string[] | undefined {
    const lines: string[] = [];
    
    if (this.redLineStations.includes(station)) lines.push('Red Line');
    if (this.blueLineStations.includes(station)) lines.push('Blue Line');
    if (this.greenLineStations.includes(station)) lines.push('Green Line');
    
    return lines.length > 1 ? lines : undefined;
  }

  getStationsByLine(lineName: string): string[] {
    switch (lineName) {
      case 'Red Line': return this.redLineStations;
      case 'Blue Line': return this.blueLineStations;
      case 'Green Line': return this.greenLineStations;
      default: return [];
    }
  }

  getStationLine(stationName: string): string | null {
    if (this.redLineStations.includes(stationName)) return 'Red Line';
    if (this.blueLineStations.includes(stationName)) return 'Blue Line';
    if (this.greenLineStations.includes(stationName)) return 'Green Line';
    return null;
  }

  isInterchangeStation(stationName: string): boolean {
    return this.interchangeStations.includes(stationName);
  }

  getAdjacentStations(stationName: string): string[] {
    const adjacent: string[] = [];
    
    // Check Red Line
    const redIndex = this.redLineStations.indexOf(stationName);
    if (redIndex !== -1) {
      if (redIndex > 0) adjacent.push(this.redLineStations[redIndex - 1]);
      if (redIndex < this.redLineStations.length - 1) adjacent.push(this.redLineStations[redIndex + 1]);
    }
    
    // Check Blue Line
    const blueIndex = this.blueLineStations.indexOf(stationName);
    if (blueIndex !== -1) {
      if (blueIndex > 0) adjacent.push(this.blueLineStations[blueIndex - 1]);
      if (blueIndex < this.blueLineStations.length - 1) adjacent.push(this.blueLineStations[blueIndex + 1]);
    }
    
    // Check Green Line
    const greenIndex = this.greenLineStations.indexOf(stationName);
    if (greenIndex !== -1) {
      if (greenIndex > 0) adjacent.push(this.greenLineStations[greenIndex - 1]);
      if (greenIndex < this.greenLineStations.length - 1) adjacent.push(this.greenLineStations[greenIndex + 1]);
    }
    
    return adjacent;
  }
}

export const metroData = new MetroDataService();
