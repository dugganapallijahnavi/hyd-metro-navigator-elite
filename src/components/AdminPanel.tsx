import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Train, MapPin } from 'lucide-react';
import { metroData } from '@/lib/metroData';
import { useToast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const { toast } = useToast();
  const [newLineName, setNewLineName] = useState('');
  const [newLineColor, setNewLineColor] = useState('');
  const [newStationName, setNewStationName] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [isInterchange, setIsInterchange] = useState('false');

  const lines = metroData.getAllLines();
  const stations = metroData.getAllStations();

  const handleAddLine = () => {
    if (!newLineName || !newLineColor) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Line Added",
      description: `${newLineName} has been added successfully`,
    });
    
    setNewLineName('');
    setNewLineColor('');
  };

  const handleAddStation = () => {
    if (!newStationName || !selectedLine) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Station Added",
      description: `${newStationName} has been added to ${selectedLine}`,
    });
    
    setNewStationName('');
    setSelectedLine('');
    setIsInterchange('false');
  };

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {lines.map((line, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full ${line.colorClass}`}></div>
                            <span className="font-medium">{line.name}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Select value={selectedLine} onValueChange={setSelectedLine}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select line" />
                        </SelectTrigger>
                        <SelectContent>
                          {lines.map((line, index) => (
                            <SelectItem key={index} value={line.name}>
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
                    {stations.map((station, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${station.lineColor}`}></div>
                          <span className="font-medium">{station.name}</span>
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
                          <Button size="sm" variant="outline">
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
