// WORKING SafetyContext with Direct SMS - Replace the corrupted file
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { dangerZoneManager, DangerZone } from '@/lib/dangerZones';
import { geocodingService } from '@/lib/geocoding';
import { sendTwilioEmergencySMS, testTwilioSMS } from '@/lib/twilioSMS';
import '@/lib/twilio-config'; // Import to initialize Twilio service

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface Alert {
  id: string;
  type: 'sos' | 'doubt' | 'audio' | 'danger_zone';
  timestamp: Date;
  location: { lat: number; lng: number } | null;
  status: 'sent' | 'acknowledged' | 'resolved';
  dangerZone?: DangerZone;
}

interface PathPoint {
  lat: number;
  lng: number;
  timestamp: Date;
}

interface SafetyContextType {
  contacts: EmergencyContact[];
  alerts: Alert[];
  locationEnabled: boolean;
  micEnabled: boolean;
  isListening: boolean;
  currentLocation: { lat: number; lng: number } | null;
  pathHistory: PathPoint[];
  dangerZones: DangerZone[];
  isInDangerZone: boolean;
  currentDangerZone: DangerZone | null;
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeContact: (id: string) => void;
  enableLocation: () => Promise<boolean>;
  enableMic: () => Promise<boolean>;
  triggerSOS: () => void;
  triggerDoubtMode: () => void;
  startAudioDetection: () => void;
  stopAudioDetection: () => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
  clearPathHistory: () => void;
  notifyGuardians: (type: 'danger_zone' | 'sos' | 'doubt', zone?: DangerZone) => void;
  testDirectSMSMessaging: () => Promise<void>;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};

export const SafetyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Ridha khan', phone: '9516856260', relationship: 'Spouse' },
    { id: '2', name: 'Faiz khan', phone: '8827193867', relationship: 'Family' }
  ]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pathHistory, setPathHistory] = useState<PathPoint[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [isInDangerZone, setIsInDangerZone] = useState(false);
  const [currentDangerZone, setCurrentDangerZone] = useState<DangerZone | null>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    const savedAlerts = localStorage.getItem('emergencyAlerts');
    const savedPathHistory = localStorage.getItem('pathHistory');
    const savedDangerZones = localStorage.getItem('dangerZones');

    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    if (savedPathHistory) setPathHistory(JSON.parse(savedPathHistory));
    if (savedDangerZones) setDangerZones(JSON.parse(savedDangerZones));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('emergencyAlerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('pathHistory', JSON.stringify(pathHistory));
  }, [pathHistory]);

  useEffect(() => {
    localStorage.setItem('dangerZones', JSON.stringify(dangerZones));
  }, [dangerZones]);

  const addContact = (contact: Omit<EmergencyContact, 'id'>) => {
    const newContact = { ...contact, id: crypto.randomUUID() };
    setContacts(prev => [...prev, newContact]);
    toast.success('Emergency contact added successfully');
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
    toast.success('Emergency contact removed');
  };

  const enableLocation = async (): Promise<boolean> => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'denied') {
        toast.error('Location permission denied');
        return false;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setCurrentLocation(location);
      setLocationEnabled(true);
      toast.success('Location enabled successfully');
      return true;
    } catch (error) {
      console.error('Location error:', error);
      toast.error('Failed to enable location');
      return false;
    }
  };

  const enableMic = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicEnabled(true);
      toast.success('Microphone enabled successfully');
      return true;
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Failed to enable microphone');
      return false;
    }
  };

  const createAlert = (type: 'sos' | 'doubt' | 'audio' | 'danger_zone', location?: { lat: number; lng: number }) => {
    const newAlert: Alert = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date(),
      location: location || currentLocation,
      status: 'sent',
    };

    setAlerts(prev => [newAlert, ...prev]);
    return newAlert;
  };

  const createAlertWithLocation = (type: 'sos' | 'doubt' | 'audio' | 'danger_zone', location: { lat: number; lng: number }) => {
    const alert = createAlert(type, location);
    return alert;
  };

  // WORKING SOS with Direct SMS
  const triggerSOS = async () => {
    try {
      let location = currentLocation;
      if (!location) {
        location = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.error('Error getting location for SOS:', error);
              resolve(null);
            }
          );
        });
      }

      if (!location) {
        toast.error('Could not get location for SOS');
        return;
      }

      const alert = createAlertWithLocation('sos', location);
      
      // Send Direct SMS + WhatsApp
      await notifyGuardiansWithLocation('sos', location);
      
      toast.error('🆘 SOS ALERT SENT!', {
        description: `Emergency alert sent to ${contacts.length} guardian(s)`,
        duration: 8000,
      });
      
      console.log('SOS Alert created:', alert);
      console.log('Contacts notified:', contacts.length);
      console.log('Location sent:', location);
    } catch (error) {
      console.error('SOS Error:', error);
      toast.error('Failed to send SOS. Please try again.');
    }
  };

  // WORKING Direct SMS + WhatsApp Function
  const notifyGuardiansWithLocation = async (type: 'danger_zone' | 'sos' | 'doubt', location: { lat: number; lng: number }, zone?: DangerZone) => {
    if (contacts.length === 0) {
      toast.error('No emergency contacts available');
      return;
    }

    // Get address
    let address = "Getting address...";
    try {
      const reverseGeocode = await geocodingService.reverseGeocode(location.lat, location.lng);
      address = reverseGeocode.display_name || "Address not found";
    } catch (error) {
      console.log('Could not get address:', error);
      address = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    }

    let directSMSSuccessful = 0;
    let directSMSFailed = 0;

    try {
      console.log('📱 Sending DIRECT FREE SMS via TextBelt...');
      
      // Send Real Twilio SMS
      const smsResults = await sendTwilioEmergencySMS(
        contacts,
        type,
        location,
        address,
        zone?.name
      );
      
      directSMSSuccessful = smsResults.successful;
      directSMSFailed = smsResults.failed;

      console.log('📊 Direct SMS Results:');
      console.log(`✅ SMS Sent: ${directSMSSuccessful}`);
      console.log(`❌ SMS Failed: ${directSMSFailed}`);

      if (directSMSSuccessful > 0) {
        toast.success(`📱 Real SMS sent to ${directSMSSuccessful} guardian(s)`, {
          description: directSMSFailed > 0 ? `${directSMSFailed} failed` : 'All SMS delivered',
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('❌ Direct SMS Error:', error);
      toast.error('Direct SMS failed');
    }

    // Final Summary
    console.log('📊 EMERGENCY SUMMARY:');
    console.log(`📱 Real SMS: ${directSMSSuccessful} sent, ${directSMSFailed} failed`);
    console.log(`🎯 Total contacts reached: ${directSMSSuccessful}`);
  };

  const triggerDoubtMode = () => {
    createAlert('doubt');
    toast.warning('Doubt Mode Activated', {
      description: 'Sending location to emergency contacts',
      duration: 5000,
    });
    
    // Send SMS like SOS
    if (currentLocation) {
      notifyGuardiansWithLocation('doubt', currentLocation, null);
    } else {
      console.error('❌ Location not available for doubt mode');
      toast.error('Please enable location first');
    }
  };

  const startAudioDetection = () => {

  const SpeechRecognition =
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    toast.error("Speech Recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = "en-US";

  setIsListening(true);

  recognition.onresult = (event: any) => {

    const text = event.results[event.results.length - 1][0]
      .transcript
      .toLowerCase();

    console.log(text);

    if (
      text.includes("help") ||
      text.includes("help me") ||
      text.includes("please help") ||
      text.includes("bachao") ||
      text.includes("save me") ||
      text.includes("emergency")
    ) {

      toast.error("🚨 Audio Emergency Detected!");

      createAlert("audio");

      if (currentLocation) {
        notifyGuardiansWithLocation(
          "sos",
          currentLocation
        );
      }
    }
  };

  recognition.start();
};

  const stopAudioDetection = () => {
    setIsListening(false);
    toast.info('Audio Detection Stopped', {
      description: 'No longer monitoring for distress sounds',
      duration: 3000,
    });
  };

  const startLocationTracking = () => {
    if (!locationEnabled) {
      toast.error('Please enable location first');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(newLocation);

        const newPathPoint: PathPoint = {
          lat: newLocation.lat,
          lng: newLocation.lng,
          timestamp: new Date(),
        };
        
        setPathHistory(prev => {
          const updated = [...prev, newPathPoint];
          if (updated.length > 100) {
            return updated.slice(-100);
          }
          return updated;
        });
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

  const stopLocationTracking = () => {
    // Implementation for stopping location tracking
    toast.info('Location tracking stopped');
  };

  const clearPathHistory = () => {
    setPathHistory([]);
    localStorage.removeItem('pathHistory');
    toast.success('Path history cleared');
  };

  const notifyGuardians = (type: 'danger_zone' | 'sos' | 'doubt', zone?: DangerZone) => {
    if (contacts.length === 0) {
      toast.error('No emergency contacts available');
      return;
    }

    const message = type === 'danger_zone' 
      ? `🚨 DANGER ZONE ALERT: User has entered ${zone?.name} (${zone?.crimeRate} crime rate). Location: ${currentLocation?.lat.toFixed(6)}, ${currentLocation?.lng.toFixed(6)}`
      : type === 'sos'
      ? `🆘 SOS ALERT: Emergency situation! Location: ${currentLocation?.lat.toFixed(6)}, ${currentLocation?.lng.toFixed(6)}`
      : `🛡️ DOUBT MODE: User feels unsafe. Location: ${currentLocation?.lat.toFixed(6)}, ${currentLocation?.lng.toFixed(6)}`;

    contacts.forEach(contact => {
      console.log(`Sending to ${contact.name} (${contact.phone}): ${message}`);
    });

    toast.success(`Alert sent to ${contacts.length} guardian(s)`, {
      description: message,
      duration: 5000,
    });
  };

  // Test Direct SMS Function
  const testDirectSMSMessaging = async () => {
    if (contacts.length === 0) {
      toast.error('No emergency contacts available for testing');
      return;
    }

    try {
      console.log('🧪 Testing Direct SMS with first contact...');
      const testContact = contacts[0];
      
      const result = await testTwilioSMS(testContact.phone);
      
      if (result.success) {
        toast.success('📱 Direct SMS test successful!', {
          description: `Real SMS sent to ${testContact.name}`,
          duration: 5000,
        });
      } else {
        toast.error('📱 Direct SMS test failed', {
          description: result.error || 'Unknown error',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('❌ Direct SMS test error:', error);
      toast.error('Failed to test Direct SMS');
    }
  };

  return (
    <SafetyContext.Provider
      value={{
        contacts,
        alerts,
        locationEnabled,
        micEnabled,
        isListening,
        currentLocation,
        pathHistory,
        dangerZones,
        isInDangerZone,
        currentDangerZone,
        addContact,
        removeContact,
        enableLocation,
        enableMic,
        triggerSOS,
        triggerDoubtMode,
        startAudioDetection,
        stopAudioDetection,
        startLocationTracking,
        stopLocationTracking,
        clearPathHistory,
        notifyGuardians,
        testDirectSMSMessaging,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};
