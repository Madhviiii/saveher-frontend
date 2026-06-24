import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSafety } from '@/contexts/SafetyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  MapPin, 
  Mic, 
  LogOut,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { 
    contacts, 
    alerts, 
    locationEnabled, 
    micEnabled,
    enableLocation,
    enableMic
  } = useSafety();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <div className="container max-w-2xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center shadow-glow">
                <User className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold">{contacts.length}</p>
              <p className="text-sm text-muted-foreground">Emergency Contacts</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <p className="text-3xl font-bold">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
            </CardContent>
          </Card>
        </div>

        {/* Permissions */}
        <Card className="mb-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Permissions
            </CardTitle>
            <CardDescription>
              Control app permissions for safety features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location Access</p>
                  <p className="text-sm text-muted-foreground">Required for live tracking</p>
                </div>
              </div>
              {locationEnabled ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Enabled</span>
                </div>
              ) : (
                <Button size="sm" onClick={enableLocation}>
                  Enable
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Mic className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Microphone Access</p>
                  <p className="text-sm text-muted-foreground">Required for audio detection</p>
                </div>
              </div>
              {micEnabled ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Enabled</span>
                </div>
              ) : (
                <Button size="sm" onClick={enableMic}>
                  Enable
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="mb-6 border-primary/20 bg-primary/5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Safety Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Always keep location enabled when traveling alone</p>
            <p>• Add at least 2-3 emergency contacts for redundancy</p>
            <p>• Test the SOS feature periodically to ensure it works</p>
            <p>• Keep your phone charged during late-night travel</p>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full text-destructive border-destructive/50 hover:bg-destructive/10 animate-fade-in"
          style={{ animationDelay: '0.35s' }}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
