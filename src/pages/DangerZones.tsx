import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DangerZoneManager from '@/components/maps/DangerZoneManager';

const DangerZones = () => {
  const { isAuthenticated } = useAuth();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Danger Zones</h1>
          <p className="text-muted-foreground">
            Manage and monitor high-crime areas for safety alerts
          </p>
        </div>
        
        <DangerZoneManager />
      </div>
    </div>
  );
};

export default DangerZones;
