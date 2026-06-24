import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSafety } from '@/contexts/SafetyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  Mic, 
  MapPin,
  Clock,
  History as HistoryIcon,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const History = () => {
  const { isAuthenticated } = useAuth();
  const { alerts } = useSafety();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sos':
        return <AlertTriangle className="h-5 w-5" />;
      case 'doubt':
        return <Shield className="h-5 w-5" />;
      case 'audio':
        return <Mic className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'sos':
        return {
          bg: 'bg-destructive/10',
          text: 'text-destructive',
          badge: 'destructive' as const,
        };
      case 'doubt':
        return {
          bg: 'bg-warning/10',
          text: 'text-warning',
          badge: 'secondary' as const,
        };
      case 'audio':
        return {
          bg: 'bg-secondary/10',
          text: 'text-secondary',
          badge: 'outline' as const,
        };
      default:
        return {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
          badge: 'secondary' as const,
        };
    }
  };

  const getAlertLabel = (type: string) => {
    switch (type) {
      case 'sos':
        return 'SOS Alert';
      case 'doubt':
        return 'Doubt Mode';
      case 'audio':
        return 'Audio Detection';
      default:
        return 'Alert';
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-2xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Alert History</h1>
          <p className="text-muted-foreground">
            View all your past emergency alerts
          </p>
        </div>

        {alerts.length === 0 ? (
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <HistoryIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No alerts yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Your alert history will appear here when you trigger SOS, Doubt Mode, or Audio Detection
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const styles = getAlertStyles(alert.type);
              return (
                <Card 
                  key={alert.id} 
                  className="animate-fade-in hover:shadow-lg transition-shadow"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${styles.bg} ${styles.text} flex items-center justify-center shrink-0`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{getAlertLabel(alert.type)}</h3>
                          <Badge variant={styles.badge} className="text-xs">
                            {alert.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(alert.timestamp), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                        {alert.location && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                      <CheckCircle className="h-5 w-5 text-success shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {alerts.length > 0 && (
          <Card className="mt-8 border-muted animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="text-base">Alert Statistics</CardTitle>
              <CardDescription>Overview of your safety alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-destructive/10">
                  <p className="text-2xl font-bold text-destructive">
                    {alerts.filter(a => a.type === 'sos').length}
                  </p>
                  <p className="text-xs text-muted-foreground">SOS Alerts</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <p className="text-2xl font-bold text-warning">
                    {alerts.filter(a => a.type === 'doubt').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Doubt Mode</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/10">
                  <p className="text-2xl font-bold text-secondary">
                    {alerts.filter(a => a.type === 'audio').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Audio Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
