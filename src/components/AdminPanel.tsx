import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Train, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchAllLines, 
  fetchAllStations, 
  createLine, 
  createStation, 
  deleteLine, 
  deleteStation,
  MetroLine,
  Station
} from '@/lib/metroDbService';

interface AdminPanelProps {
  onDataChange?: () => void;
}

const AdminPanel = ({ onDataChange }: AdminPanelProps) => {
  const { toast } = useToast();
  const [newLineName, setNewLineName] = useState('');
  const [newLineColor, setNewLineColor] = useState('');
  const [newLineRoute, setNewLineRoute] = useState('');
  const [newStationName, setNewStationName] = useState('');
  const [selectedLineId, setSelectedLineId] = useState('');
  const [stationPosition, setStationPosition] = useState('');
  const [isInterchange, setIsInterchange] = useState('false');
  const [lines, setLines] = useState<MetroLine[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [linesData, stationsData] = await Promise.all([
        fetchAllLines(),
        fetchAllStations()
      ]);
      setLines(linesData);
      setStations(stationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load metro data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = async () => {
    if (!newLineName || !newLineColor || !newLineRoute) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const colorClassMap: Record<string, string> = {
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        yellow: 'bg-yellow-500',
        pink: 'bg-pink-500',
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500'
      };

      await createLine(newLineName, newLineColor, colorClassMap[newLineColor] || 'bg-gray-500', newLineRoute);
      
      toast({
        title: "Line Added",
        description: `${newLineName} has been added successfully`,
      });
      
      setNewLineName('');
      setNewLineColor('');
      setNewLineRoute('');
      loadData();
      onDataChange?.();
    } catch (error) {
      console.error('Error adding line:', error);
      toast({
        title: "Error",
        description: "Failed to add line. It may already exist.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLine = async (lineId: string, lineName: string) => {
    try {
      await deleteLine(lineId);
      toast({
        title: "Line Deleted",
        description: `${lineName} has been removed`,
      });
      loadData();
      onDataChange?.();
    } catch (error) {
      console.error('Error deleting line:', error);
      toast({
        title: "Error",
        description: "Failed to delete line",
        variant: "destructive"
      });
    }
  };

  const handleAddStation = async () => {
    if (!newStationName || !selectedLineId || !stationPosition) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createStation(
        newStationName, 
        selectedLineId, 
        parseInt(stationPosition), 
        isInterchange === 'true'
      );
      
      const selectedLine = lines.find(l => l.id === selectedLineId);
      toast({
        title: "Station Added",
        description: `${newStationName} has been added to ${selectedLine?.name}`,
      });
      
      setNewStationName('');
      setSelectedLineId('');
      setStationPosition('');
      setIsInterchange('false');
      loadData();
      onDataChange?.();
    } catch (error) {
      console.error('Error adding station:', error);
      toast({
        title: "Error",
        description: "Failed to add station. It may already exist on this line.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStation = async (stationId: string, stationName: string) => {
    try {
      await deleteStation(stationId);
      toast({
        title: "Station Deleted",
        description: `${stationName} has been removed`,
      });
      loadData();
      onDataChange?.();
    } catch (error) {
      console.error('Error deleting station:', error);
      toast({
        title: "Error",
        description: "Failed to delete station",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Network Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="lines" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lines">Metro Lines</TabsTrigger>
              <TabsTrigger value="stations">Stations</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="lines" className="space-y-6">
              {/* Add New Line */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Add New Metro Line</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lineName">Line Name</Label>
                      <Input
                        id="lineName"
                        placeholder="e.g., Purple Line"
                        value={newLineName}
                        onChange={(e) => setNewLineName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lineColor">Line Color</Label>
                      <Select value={newLineColor} onValueChange={setNewLineColor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="pink">Pink</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lineRoute">Route</Label>
                      <Input
                        id="lineRoute"
                        placeholder="e.g., Station A ↔ Station B"
                        value={newLineRoute}
                        onChange={(e) => setNewLineRoute(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddLine} className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Lines */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Metro Lines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lines.map((line) => (
                      <div key={line.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full ${line.colorClass}`}></div>
                            <span className="font-medium">{line.name}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteLine(line.id, line.name)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{line.stations.length} stations</p>
                          <p>{line.route}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stations" className="space-y-6">
              {/* Add New Station */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Add New Station</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stationName">Station Name</Label>
                      <Input
                        id="stationName"
                        placeholder="e.g., New Station"
                        value={newStationName}
                        onChange={(e) => setNewStationName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="selectLine">Metro Line</Label>
                      <Select value={selectedLineId} onValueChange={setSelectedLineId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select line" />
                        </SelectTrigger>
                        <SelectContent>
                          {lines.map((line) => (
                            <SelectItem key={line.id} value={line.id}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${line.colorClass}`}></div>
                                <span>{line.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stationPosition">Position</Label>
                      <Input
                        id="stationPosition"
                        type="number"
                        placeholder="e.g., 5"
                        value={stationPosition}
                        onChange={(e) => setStationPosition(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interchange">Interchange Station</Label>
                      <Select value={isInterchange} onValueChange={setIsInterchange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddStation} className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Station
                  </Button>
                </CardContent>
              </Card>

              {/* Stations List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Stations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {stations.map((station) => (
                      <div key={station.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${station.lineColor}`}></div>
                          <span className="font-medium">{station.name}</span>
                          <span className="text-sm text-gray-500">({station.line})</span>
                          {station.isInterchange && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Interchange
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteStation(station.id, station.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Train className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{lines.length}</p>
                        <p className="text-sm text-gray-600">Metro Lines</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <MapPin className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{stations.length}</p>
                        <p className="text-sm text-gray-600">Total Stations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">↔</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {stations.filter(s => s.isInterchange).length}
                        </p>
                        <p className="text-sm text-gray-600">Interchanges</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">₹</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">₹10</p>
                        <p className="text-sm text-gray-600">Base Fare</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
