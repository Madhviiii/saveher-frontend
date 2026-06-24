import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Smartphone, 
  Mail, 
  Share2, 
  Copy, 
  ExternalLink,
  QrCode,
  Check,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  freeMessagingService, 
  sendFreeEmergencyAlert, 
  openWhatsAppForContact,
  copyEmergencyMessage 
} from '@/lib/freeMessaging';

const FreeMessagingDemo: React.FC = () => {
  const [testContacts] = useState([
    { name: 'Ridha Khan', phone: '+919516856260' },
    { name: 'Faiz Khan', phone: '+918827193867' },
    { name: 'madhvi sisodiya',phone:'+916264775050'}
  ]);
  
  const [testLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [testAddress] = useState('Connaught Place, New Delhi, Delhi 110001, India');
  const [messageResults, setMessageResults] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleTestSOS = async () => {
    try {
      const results = await sendFreeEmergencyAlert(
        testContacts,
        'sos',
        testLocation,
        testAddress
      );
      setMessageResults(results);
      
      toast.success('SOS alert prepared successfully!', {
        description: 'Check links below to share',
        duration: 3000,
      });
    } catch (error) {
      console.error('SOS test error:', error);
      toast.error('Failed to prepare SOS alert');
    }
  };

  const handleTestDangerZone = async () => {
    try {
      const results = await sendFreeEmergencyAlert(
        testContacts,
        'danger_zone',
        testLocation,
        testAddress,
        'Connaught Place Danger Zone'
      );
      setMessageResults(results);
      
      toast.success('Danger zone alert prepared!', {
        description: 'Check links below to share',
        duration: 3000,
      });
    } catch (error) {
      console.error('Danger zone test error:', error);
      toast.error('Failed to prepare danger zone alert');
    }
  };

  const handleCopyMessage = async (message: string) => {
    const success = await copyEmergencyMessage(message);
    if (success) {
      setCopied(true);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy message');
    }
  };

  const generateSampleMessage = (type: 'sos' | 'danger_zone' | 'doubt') => {
    const timestamp = new Date().toLocaleString();
    
    switch (type) {
      case 'sos':
        return `🆘 EMERGENCY SOS ALERT!
User triggered emergency SOS
Time: ${timestamp}
📍 Address: ${testAddress}
🗺️ Maps: https://maps.google.com/?q=${testLocation.lat},${testLocation.lng}
📞 CALL IMMEDIATELY!`;
      case 'danger_zone':
        return `🚨 DANGER ZONE ALERT!
User entered: Connaught Place Danger Zone
Time: ${timestamp}
📍 Address: ${testAddress}
🗺️ Maps: https://maps.google.com/?q=${testLocation.lat},${testLocation.lng}`;
      case 'doubt':
        return `🛡️ DOUBT MODE ALERT!
User feels unsafe
Time: ${timestamp}
📍 Address: ${testAddress}
🗺️ Maps: https://maps.google.com/?q=${testLocation.lat},${testLocation.lng}`;
      default:
        return `Emergency alert at ${testAddress}`;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            FREE Emergency Messaging Demo
          </CardTitle>
          <CardDescription>
            Test free WhatsApp, SMS, and email messaging - no API keys required!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This is a <strong>completely FREE</strong> messaging system for your prototype. 
              It uses WhatsApp links, SMS app links, and email client links - no paid services needed!
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-3 gap-4">
            <Button onClick={handleTestSOS} className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Test SOS Alert
            </Button>
            <Button onClick={handleTestDangerZone} variant="outline" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Test Danger Zone
            </Button>
            <Button 
              onClick={() => handleCopyMessage(generateSampleMessage('sos'))} 
              variant="outline" 
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Message'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {messageResults && (
        <Card>
          <CardHeader>
            <CardTitle>Messaging Results</CardTitle>
            <CardDescription>
              Links ready to share with emergency contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={messageResults.whatsapp ? "default" : "secondary"}>
                  <Smartphone className="h-3 w-3 mr-1" />
                  WhatsApp Ready
                </Badge>
                <Badge variant={messageResults.email ? "default" : "secondary"}>
                  <Mail className="h-3 w-3 mr-1" />
                  Email Ready
                </Badge>
                <Badge variant={messageResults.webShare ? "default" : "secondary"}>
                  <Share2 className="h-3 w-3 mr-1" />
                  Web Share Ready
                </Badge>
              </div>

              <div className="space-y-3">
                {messageResults.details.map((detail: string, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">
                      {detail.split(':')[0]}
                    </div>
                    <div className="space-y-1">
                      {detail.split(':').slice(1).join(':').split(' | ').map((link: string, linkIndex: number) => (
                        <div key={linkIndex} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {link.split(':')[0]}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = link.split(':')[1].trim();
                              if (url.startsWith('http')) {
                                window.open(url, '_blank');
                              }
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>How FREE Messaging Works</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="whatsapp" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <h4 className="font-medium">WhatsApp Sharing</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Uses WhatsApp's built-in sharing feature. Opens WhatsApp with pre-filled message.
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-xs">
                  https://wa.me/[phone]?text=[encoded_message]
                </code>
              </div>
              <ul className="text-sm space-y-1">
                <li>✅ Completely free</li>
                <li>✅ No API keys needed</li>
                <li>✅ Works worldwide</li>
                <li>✅ Instant delivery</li>
              </ul>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <h4 className="font-medium">SMS App Links</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Opens the phone's native SMS app with pre-filled message.
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-xs">
                  sms:[phone]?body=[encoded_message]
                </code>
              </div>
              <ul className="text-sm space-y-1">
                <li>✅ Uses native SMS app</li>
                <li>✅ No SMS gateway costs</li>
                <li>✅ User controls sending</li>
                <li>✅ Works on all phones</li>
              </ul>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <h4 className="font-medium">Email Client</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Opens default email client with pre-filled emergency email.
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-xs">
                  mailto:[email]?subject=[subject]&body=[message]
                </code>
              </div>
              <ul className="text-sm space-y-1">
                <li>✅ Uses email app</li>
                <li>✅ No email service costs</li>
                <li>✅ Detailed information</li>
                <li>✅ Professional delivery</li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => openWhatsAppForContact(testContacts[0], generateSampleMessage('sos'))}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Open WhatsApp Now
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const qrUrl = freeMessagingService.generateEmergencyQR(
                  testLocation, 
                  generateSampleMessage('sos')
                );
                window.open(qrUrl, '_blank');
              }}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreeMessagingDemo;
