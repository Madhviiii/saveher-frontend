// Real SMS Service using Twilio API
// Actually sends SMS to phone numbers

export interface TwilioSMSResult {
  success: boolean;
  message: string;
  sms_id?: string;
  error?: string;
}

class TwilioSMSService {
  private accountSid: string;
  private authToken: string;
  private twilioPhone: string;

  constructor(accountSid: string, authToken: string, twilioPhone: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.twilioPhone = twilioPhone;
  }

  async sendSMS(to: string, message: string): Promise<TwilioSMSResult> {
    try {
      // Clean phone number (remove +91, spaces, dashes)
      const cleanPhone = to.replace(/[^\d]/g, '');
      
      // Add country code for India if missing
      const fullPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
      
      // Validate phone number
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return {
          success: false,
          message: 'Invalid phone number',
          error: 'Phone number must be 10-15 digits'
        };
      }

      console.log('📱 Sending REAL SMS via Twilio...');
      console.log(`From: ${this.twilioPhone}`);
      console.log(`To: ${fullPhone}`);
      console.log(`Message: ${message.substring(0, 100)}...`);

      // Use Twilio API
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`)
        },
        body: new URLSearchParams({
          To: fullPhone,
          From: this.twilioPhone,
          Body: message
        })
      });

      const result = await response.json();
      console.log('📊 Twilio Response:', result);

      if (response.ok && result.sid) {
        return {
          success: true,
          message: 'SMS sent successfully',
          sms_id: result.sid
        };
      } else {
        return {
          success: false,
          message: 'SMS sending failed',
          error: result.message || 'Unknown error'
        };
      }

    } catch (error) {
      console.error('❌ Twilio Error:', error);
      return {
        success: false,
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBulkSMS(recipients: Array<{ phone: string; name: string }>, message: string): Promise<{
    successful: number;
    failed: number;
    details: Array<{ name: string; phone: string; success: boolean; error?: string; sms_id?: string }>;
  }> {
    const results = {
      successful: 0,
      failed: 0,
      details: [] as Array<{ name: string; phone: string; success: boolean; error?: string; sms_id?: string }>
    };

    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS(recipient.phone, message);
        
        results.details.push({
          name: recipient.name,
          phone: recipient.phone,
          success: result.success,
          error: result.error,
          sms_id: result.sms_id
        });

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        results.details.push({
          name: recipient.name,
          phone: recipient.phone,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        results.failed++;
      }
    }

    return results;
  }

  // Test SMS function
  async sendTestSMS(phone: string): Promise<TwilioSMSResult> {
    const testMessage = `🧪 SaveHer App Test SMS
Time: ${new Date().toLocaleString()}
This is a test message from your emergency alert system.
Real SMS working!`;

    return this.sendSMS(phone, testMessage);
  }

  // Emergency SMS templates (English only - no Hindi characters)
  getSOSMessage(location: { lat: number; lng: number }, address: string, timestamp: string): string {
    return `SOS! I am in danger. Need urgent help.
My live location: https://maps.google.com/?q=${location.lat},${location.lng}
Please reach or call me immediately.`;
  }

  getDangerZoneMessage(zoneName: string, location: { lat: number; lng: number }, address: string, timestamp: string): string {
    return `SOS! I'm in danger. Need urgent help.
My live location: https://maps.google.com/?q=${location.lat},${location.lng}
Please reach or call me immediately.`;
  }

  getDoubtModeMessage(location: { lat: number; lng: number }, address: string, timestamp: string): string {
    return `DOUBT! I feel unsafe.
My live location: https://maps.google.com/?q=${location.lat},${location.lng}
Please check on me.`;
  }
}

// Singleton instance (will be configured with your credentials)
export let twilioSMSService: TwilioSMSService;

// Initialize with your credentials
export const initializeTwilio = (accountSid: string, authToken: string, twilioPhone: string) => {
  twilioSMSService = new TwilioSMSService(accountSid, authToken, twilioPhone);
  console.log('📱 Twilio SMS Service initialized');
};

// Helper functions
export const sendTwilioEmergencySMS = async (
  contacts: Array<{ name: string; phone: string }>,
  alertType: 'sos' | 'danger_zone' | 'doubt',
  location: { lat: number; lng: number },
  address: string,
  zoneName?: string
) => {
  if (!twilioSMSService) {
    throw new Error('Twilio service not initialized. Call initializeTwilio() first.');
  }

  const timestamp = new Date().toLocaleString();
  
  let message: string;
  switch (alertType) {
    case 'sos':
      message = twilioSMSService.getSOSMessage(location, address, timestamp);
      break;
    case 'danger_zone':
      message = twilioSMSService.getDangerZoneMessage(zoneName || '', location, address, timestamp);
      break;
    case 'doubt':
      message = twilioSMSService.getDoubtModeMessage(location, address, timestamp);
      break;
    default:
      message = `Emergency alert at ${address} - SaveHer App`;
  }

  const results = await twilioSMSService.sendBulkSMS(contacts, message);
  
  console.log('📊 Twilio SMS Results:');
  console.log(`✅ SMS Sent: ${results.successful}`);
  console.log(`❌ SMS Failed: ${results.failed}`);
  console.log('📋 Details:');
  results.details.forEach(detail => {
    console.log(`  ${detail.name} (${detail.phone}): ${detail.success ? '✅ Sent' : '❌ Failed - ' + (detail.error || 'Unknown error')}`);
  });

  return results;
};

// Test function
export const testTwilioSMS = async (phone: string) => {
  if (!twilioSMSService) {
    throw new Error('Twilio service not initialized. Call initializeTwilio() first.');
  }

  console.log('🧪 Testing Twilio SMS...');
  const result = await twilioSMSService.sendTestSMS(phone);
  
  if (result.success) {
    console.log('✅ Twilio SMS sent successfully!');
    console.log(`📱 SMS ID: ${result.sms_id}`);
  } else {
    console.error('❌ Twilio SMS failed:', result.error);
  }
  
  return result;
};
