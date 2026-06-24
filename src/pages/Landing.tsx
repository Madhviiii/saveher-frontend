import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, Mic, Phone, Bell, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Bell,
      title: 'Instant SOS',
      description: 'One-tap emergency alert to all your trusted contacts',
      gradient: 'gradient-sos',
    },
    {
      icon: Shield,
      title: 'Doubt Mode',
      description: 'Silent activation when you feel unsafe',
      gradient: 'gradient-doubt',
    },
    {
      icon: Mic,
      title: 'Audio Detection',
      description: 'AI-powered distress sound recognition',
      gradient: 'gradient-audio',
    },
    {
      icon: MapPin,
      title: 'Live Tracking',
      description: 'Real-time location sharing with loved ones',
      gradient: 'gradient-hero',
    },
  ];

  const benefits = [
    '24/7 protection at your fingertips',
    'Quick setup in under 2 minutes',
    'Works offline for emergencies',
    'No subscription required',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              Smart Safety Monitoring System
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Your Safety,{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Our Priority
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              SafeHer empowers women with instant emergency alerts, live location tracking, 
              and intelligent audio detection. Stay protected, stay confident.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="gap-2">
                Learn More
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Safety Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay safe and connected with your loved ones
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple to Setup, Easy to Use
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get protected in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your basic details', icon: Shield },
              { step: '02', title: 'Add Contacts', desc: 'Add your trusted emergency contacts', icon: Phone },
              { step: '03', title: 'Stay Protected', desc: 'Use SOS, Doubt Mode, or Audio Detection', icon: Clock },
            ].map((item, index) => (
              <div key={index} className="relative text-center animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                <div className="text-6xl font-extrabold text-primary/10 mb-4">{item.step}</div>
                <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Feel Safer?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join thousands of women who trust SafeHer for their personal safety
              </p>
              <Link to="/auth">
                <Button size="xl" className="bg-background text-primary hover:bg-background/90 gap-2">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
