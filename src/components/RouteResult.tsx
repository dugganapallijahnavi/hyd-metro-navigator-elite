
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, IndianRupee, MapPin, ArrowRight, RefreshCw } from 'lucide-react';

interface RouteResultProps {
  result: {
    route: string[];
    totalStations: number;
    totalFare: number;
    interchanges: string[];
    estimatedTime: string;
    lineChanges: Array<{
      from: string;
      to: string;
      at: string;
    }>;
  };
}

const RouteResult = ({ result }: RouteResultProps) => {
  const getLineColor = (lineName: string) => {
    switch (lineName) {
      case 'Red Line': return 'bg-red-500';
      case 'Blue Line': return 'bg-blue-500';
      case 'Green Line': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Journey Summary */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Journey Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Travel Time</p>
                <p className="text-xl font-bold text-blue-600">{result.estimatedTime}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <IndianRupee className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Fare</p>
                <p className="text-xl font-bold text-green-600">₹{result.totalFare}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Stations</p>
                <p className="text-xl font-bold text-purple-600">{result.totalStations}</p>
              </div>
            </div>
          </div>

          {result.interchanges.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>Interchanges</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.interchanges.map((interchange, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {interchange}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Path */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRight className="h-5 w-5" />
            <span>Route Path</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {result.route.map((station, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${
                    result.interchanges.includes(station) 
                      ? 'bg-yellow-500 ring-4 ring-yellow-200' 
                      : 'bg-blue-500'
                  }`}></div>
                  {index < result.route.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{station}</p>
                  {result.interchanges.includes(station) && (
                    <p className="text-sm text-yellow-600 font-medium">Interchange Station</p>
                  )}
                </div>
                {index === 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-600">Start</Badge>
                )}
                {index === result.route.length - 1 && (
                  <Badge variant="outline" className="text-red-600 border-red-600">End</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Changes */}
      {result.lineChanges.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Line Changes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {result.lineChanges.map((change, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full ${getLineColor(change.from)}`}></div>
                  <span className="font-medium">{change.from}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className={`w-4 h-4 rounded-full ${getLineColor(change.to)}`}></div>
                  <span className="font-medium">{change.to}</span>
                  <span className="text-sm text-gray-600">at {change.at}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RouteResult;
