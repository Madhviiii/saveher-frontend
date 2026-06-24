import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSafety } from '@/contexts/SafetyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Shield, 
  Mic, 
  MicOff, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Phone,
  ArrowRight,
  Play,
  Square
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SafetyMap from '@/components/maps/SafetyMap';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    contacts, 
    locationEnabled, 
    micEnabled, 
    isListening,
    currentLocation,
    pathHistory,
    dangerZones,
    isInDangerZone,
    enableLocation, 
    enableMic,
    triggerSOS,
    triggerDoubtMode,
    startAudioDetection,
    stopAudioDetection,
    startLocationTracking,
    stopLocationTracking,
    clearPathHistory,
    notifyGuardians
  } = useSafety();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-4xl">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">
            Hello, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Your safety dashboard is ready. Stay protected.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4 flex items-center gap-3">
              {locationEnabled ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{locationEnabled ? 'Active' : 'Off'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <CardContent className="p-4 flex items-center gap-3">
              {micEnabled ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Microphone</p>
                <p className="text-sm font-medium">{micEnabled ? 'Active' : 'Off'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-4 flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Contacts</p>
                <p className="text-sm font-medium">{contacts.length} saved</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <CardContent className="p-4 flex items-center gap-3">
              {isListening ? (
                <Mic className="h-5 w-5 text-secondary animate-pulse" />
              ) : (
                <MicOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Audio</p>
                <p className="text-sm font-medium">{isListening ? 'Listening' : 'Idle'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Prompts */}
        {(!locationEnabled || !micEnabled || contacts.length === 0) && (
          <Card className="mb-8 border-warning/50 bg-warning/5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Complete Your Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!locationEnabled && (
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Enable location for tracking</span>
                  </div>
                  <Button size="sm" onClick={enableLocation}>Enable</Button>
                </div>
              )}
              {!micEnabled && (
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mic className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Enable microphone for audio detection</span>
                  </div>
                  <Button size="sm" onClick={enableMic}>Enable</Button>
                </div>
              )}
              {contacts.length === 0 && (
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Add emergency contacts</span>
                  </div>
                  <Link to="/contacts">
                    <Button size="sm">Add</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Emergency Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* SOS Button */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">SOS Alert</CardTitle>
              <CardDescription>
                Immediately alert all your emergency contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="sos" 
                size="icon-xl" 
                className="w-full aspect-square text-2xl font-bold relative overflow-hidden"
                onClick={triggerSOS}
              >
                <div className="absolute inset-0 rounded-full border-4 border-destructive-foreground/30 animate-ripple" />
                <AlertTriangle className="h-12 w-12" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Press in emergency
              </p>
            </CardContent>
          </Card>

          {/* Doubt Mode */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Doubt Mode</CardTitle>
              <CardDescription>
                Silently share your location when feeling unsafe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="doubt" 
                size="icon-xl" 
                className="w-full aspect-square text-2xl font-bold"
                onClick={triggerDoubtMode}
              >
                <Shield className="h-12 w-12" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Silent activation
              </p>
            </CardContent>
          </Card>

          {/* Audio Detection */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Audio Detection</CardTitle>
              <CardDescription>
                {isListening ? 'Currently listening for distress sounds' : 'Detect distress sounds automatically'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant={isListening ? 'default' : 'audio'}
                size="icon-xl" 
                className="w-full aspect-square text-2xl font-bold"
                onClick={isListening ? stopAudioDetection : startAudioDetection}
                disabled={!micEnabled}
              >
                {isListening ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                {isListening ? 'Tap to stop' : micEnabled ? 'Tap to start' : 'Enable mic first'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Location Tracking Controls */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Tracking
            </CardTitle>
            <CardDescription>
              Track your movement and get danger zone alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={locationEnabled ? "default" : "outline"}
                size="sm"
                onClick={enableLocation}
                disabled={locationEnabled}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {locationEnabled ? 'Location Enabled' : 'Enable Location'}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={startLocationTracking}
                disabled={!locationEnabled}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={stopLocationTracking}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Tracking
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPathHistory}
                disabled={pathHistory.length === 0}
              >
                Clear Path
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => notifyGuardians('sos')}
              >
                Notify Guardians
              </Button>
            </div>
            
            {pathHistory.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Path points: {pathHistory.length} | 
                {isInDangerZone && (
                  <span className="text-destructive font-medium ml-2">
                    ⚠️ In Danger Zone
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Map */}
        <SafetyMap
          currentLocation={currentLocation}
          dangerZones={dangerZones}
          pathHistory={pathHistory}
          onDangerZoneEntry={(zone) => {
            console.log('Entered danger zone:', zone);
          }}
        />

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Link to="/contacts">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group animate-fade-in" style={{ animationDelay: '0.55s' }}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Manage Contacts</p>
                    <p className="text-sm text-muted-foreground">{contacts.length} emergency contacts</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-secondary/10">
                    <AlertTriangle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold">Alert History</p>
                    <p className="text-sm text-muted-foreground">View past alerts</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
