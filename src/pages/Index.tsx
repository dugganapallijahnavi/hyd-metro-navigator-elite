import { useState, useEffect } from 'react';
import { Train, MapPin, Route, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RouteResult from '@/components/RouteResult';
import AdminPanel from '@/components/AdminPanel';
import { 
  fetchAllLines, 
  fetchAllStations, 
  findRoute, 
  calculateFare, 
  calculateTime,
  MetroLine,
  Station
} from '@/lib/metroDbService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [lines, setLines] = useState<MetroLine[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setDataLoading(true);
      const [linesData, stationsData] = await Promise.all([
        fetchAllLines(),
        fetchAllStations()
      ]);
      setLines(linesData);
      setStations(stationsData);
    } catch (error) {
      console.error('Error loading metro data:', error);
      toast({
        title: "Error",
        description: "Failed to load metro data",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Get unique station names for dropdowns
  const uniqueStations = [...new Map(stations.map(s => [s.name, s])).values()];

  const handleFindRoute = async () => {
    if (!source || !destination) return;
    
    setLoading(true);
    try {
      const route = await findRoute(source, destination);
      if (route) {
        const fare = calculateFare(route);
        const time = calculateTime(route);
        setRouteResult({
          route: route.path,
          totalStations: route.path.length,
          totalFare: fare.total,
          interchanges: route.interchanges,
          estimatedTime: `${time} minutes`,
          lineChanges: route.lineChanges || []
        });
      } else {
        setRouteResult(null);
        toast({
          title: "No Route Found",
          description: "Could not find a route between the selected stations",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error finding route:', error);
      toast({
        title: "Error",
        description: "Failed to find route",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setSource('');
    setDestination('');
    setRouteResult(null);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading metro network data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-500 via-blue-500 to-green-500 p-2 rounded-lg">
                <Train className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hyderabad Metro Navigator</h1>
                <p className="text-sm text-gray-600">Elite Route Finder & Network Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-red-100 text-red-700">Red Line</Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Blue Line</Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Green Line</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="route-finder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="route-finder" className="flex items-center space-x-2">
              <Route className="h-4 w-4" />
              <span>Route Finder</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Admin Panel</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="route-finder" className="space-y-6">
            {/* Route Planning Card */}
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Plan Your Journey</span>
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Find the best route between any two metro stations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select source station" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueStations.map((station) => (
                          <SelectItem key={station.id} value={station.name}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${station.lineColor}`}></div>
                              <span>{station.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">To</label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select destination station" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueStations.map((station) => (
                          <SelectItem key={station.id} value={station.name}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${station.lineColor}`}></div>
                              <span>{station.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handleFindRoute} 
                    disabled={!source || !destination || loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Finding Route...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Route className="h-4 w-4" />
                        <span>Find Route</span>
                      </div>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearRoute}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Route Result */}
            {routeResult && <RouteResult result={routeResult} />}

            {/* Metro Lines Overview - Dynamic from database */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {lines.map((line) => (
                <Card 
                  key={line.id} 
                  className={`border-l-4 hover:shadow-lg transition-shadow ${
                    line.color === 'red' ? 'border-l-red-500' :
                    line.color === 'blue' ? 'border-l-blue-500' :
                    'border-l-green-500'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className={`flex items-center space-x-2 ${
                      line.color === 'red' ? 'text-red-600' :
                      line.color === 'blue' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      <Train className="h-5 w-5" />
                      <span>{line.name}</span>
                    </CardTitle>
                    <CardDescription>{line.route}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Stations</span>
                        <span className="font-medium">{line.stations.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Distance</span>
                        <span className="font-medium">{((line.stations.length - 1) * 1.3).toFixed(1)} km</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel onDataChange={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
