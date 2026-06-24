import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Smartphone, 
  Mail, 
  Settings, 
  Check, 
  X, 
  Key,
  Globe,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { configureMessaging, messagingService } from '@/lib/messaging';

const MessagingSettings: React.FC = () => {
  const [messagingType, setMessagingType] = useState<'whatsapp' | 'twilio' | 'indian-sms'>('whatsapp');
  const [isConfigured, setIsConfigured] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // WhatsApp Configuration
  const [whatsappConfig, setWhatsappConfig] = useState({
    accessToken: '',
    phoneNumberId: ''
  });

  // Twilio Configuration
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: '',
    authToken: '',
    fromNumber: ''
  });

  // Indian SMS Configuration
  const [indianSMSConfig, setIndianSMSConfig] = useState({
    apiKey: '',
    senderId: ''
  });

  const handleConfigure = () => {
    try {
      let credentials: any;

      switch (messagingType) {
        case 'whatsapp':
          credentials = whatsappConfig;
          if (!credentials.accessToken || !credentials.phoneNumberId) {
            toast.error('Please fill all WhatsApp credentials');
            return;
          }
          break;
        case 'twilio':
          credentials = twilioConfig;
          if (!credentials.accountSid || !credentials.authToken || !credentials.fromNumber) {
            toast.error('Please fill all Twilio credentials');
            return;
          }
          break;
        case 'indian-sms':
          credentials = indianSMSConfig;
          if (!credentials.apiKey || !credentials.senderId) {
            toast.error('Please fill all Indian SMS credentials');
            return;
          }
          break;
      }

      configureMessaging(messagingType, credentials);
      setIsConfigured(true);
      toast.success(`${messagingType.toUpperCase()} messaging configured successfully!`);
    } catch (error) {
      console.error('Configuration error:', error);
      toast.error('Failed to configure messaging service');
    }
  };

  const handleTestMessage = async () => {
    if (!isConfigured) {
      toast.error('Please configure messaging service first');
      return;
    }

    try {
      const testContact = {
        name: 'Test Contact',
        phone: '+919876543210' // Test number
      };

      const testMessage = `🧪 Test Message from SaveHer App
Time: ${new Date().toLocaleString()}
This is a test emergency alert.`;

      const results = await messagingService.sendBulkAlerts([testContact], testMessage);
      setTestResults(results);

      if (results.successful > 0) {
        toast.success('Test message sent successfully!');
      } else {
        toast.error('Test message failed');
      }
    } catch (error) {
      console.error('Test message error:', error);
      toast.error('Failed to send test message');
    }
  };

  const handleReset = () => {
    setIsConfigured(false);
    setTestResults(null);
    setWhatsappConfig({ accessToken: '', phoneNumberId: '' });
    setTwilioConfig({ accountSid: '', authToken: '', fromNumber: '' });
    setIndianSMSConfig({ apiKey: '', senderId: '' });
    toast.info('Messaging settings reset');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Emergency Messaging Settings
          </CardTitle>
          <CardDescription>
            Configure real SMS and WhatsApp messaging for emergency alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant={isConfigured ? "default" : "secondary"}>
              {isConfigured ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Configured
                </>
              ) : (
                <>
                  <X className="h-3 w-3 mr-1" />
                  Not Configured
                </>
              )}
            </Badge>
            
            {isConfigured && (
              <Button variant="outline" size="sm" onClick={handleTestMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Test Message
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Settings className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <Tabs value={messagingType} onValueChange={(value: any) => setMessagingType(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="whatsapp">
                <Smartphone className="h-4 w-4 mr-2" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="twilio">
                <Globe className="h-4 w-4 mr-2" />
                Twilio
              </TabsTrigger>
              <TabsTrigger value="indian-sms">
                <Mail className="h-4 w-4 mr-2" />
                Indian SMS
              </TabsTrigger>
            </TabsList>

            {/* WhatsApp Configuration */}
            <TabsContent value="whatsapp" className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  WhatsApp Business API provides reliable messaging in India. 
                  Get credentials from Meta for Developers.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="whatsapp-token">Access Token</Label>
                  <Input
                    id="whatsapp-token"
                    type="password"
                    placeholder="Enter WhatsApp Business API access token"
                    value={whatsappConfig.accessToken}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-phone">Phone Number ID</Label>
                  <Input
                    id="whatsapp-phone"
                    placeholder="Enter WhatsApp Business phone number ID"
                    value={whatsappConfig.phoneNumberId}
                    onChange={(e) => setWhatsappConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Twilio Configuration */}
            <TabsContent value="twilio" className="space-y-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Twilio provides global SMS and WhatsApp services. 
                  Get credentials from Twilio Console.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="twilio-sid">Account SID</Label>
                  <Input
                    id="twilio-sid"
                    type="password"
                    placeholder="Enter Twilio Account SID"
                    value={twilioConfig.accountSid}
                    onChange={(e) => setTwilioConfig(prev => ({ ...prev, accountSid: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="twilio-token">Auth Token</Label>
                  <Input
                    id="twilio-token"
                    type="password"
                    placeholder="Enter Twilio Auth Token"
                    value={twilioConfig.authToken}
                    onChange={(e) => setTwilioConfig(prev => ({ ...prev, authToken: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="twilio-number">From Number</Label>
                  <Input
                    id="twilio-number"
                    placeholder="+1234567890"
                    value={twilioConfig.fromNumber}
                    onChange={(e) => setTwilioConfig(prev => ({ ...prev, fromNumber: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Indian SMS Configuration */}
            <TabsContent value="indian-sms" className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Indian SMS services like Fast2SMS provide affordable local messaging. 
                  Get API key from Fast2SMS website.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="indian-api">API Key</Label>
                  <Input
                    id="indian-api"
                    type="password"
                    placeholder="Enter Fast2SMS API key"
                    value={indianSMSConfig.apiKey}
                    onChange={(e) => setIndianSMSConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="indian-sender">Sender ID</Label>
                  <Input
                    id="indian-sender"
                    placeholder="Enter 6-character sender ID"
                    value={indianSMSConfig.senderId}
                    onChange={(e) => setIndianSMSConfig(prev => ({ ...prev, senderId: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleConfigure} className="w-full">
            <Key className="h-4 w-4 mr-2" />
            Configure Messaging Service
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Successful:</span>
                <Badge variant="default">{testResults.successful}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <Badge variant="destructive">{testResults.failed}</Badge>
              </div>
              
              {testResults.details.map((detail: any, index: number) => (
                <div key={index} className="border rounded p-2">
                  <div className="font-medium">{detail.contact}</div>
                  <div className="text-sm text-muted-foreground">
                    SMS: {detail.sms ? '✅' : '❌'} | 
                    WhatsApp: {detail.whatsapp ? '✅' : '❌'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessagingSettings;
