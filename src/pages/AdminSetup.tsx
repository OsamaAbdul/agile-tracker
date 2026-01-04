import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import agileLogo from '@/assets/agile-logo.jpg';
import { z } from 'zod';

const adminSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AdminSetup() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [invitation, setInvitation] = useState<{ email: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Validate invitation token
    const validateToken = async () => {
      if (!inviteToken) {
        setIsValidating(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_invitations')
        .select('email, used, expires_at')
        .eq('token', inviteToken)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: 'Invalid Invitation',
          description: 'This invitation link is invalid.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      if (data.used) {
        toast({
          title: 'Invitation Used',
          description: 'This invitation has already been used.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        toast({
          title: 'Invitation Expired',
          description: 'This invitation has expired.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      setInvitation({ email: data.email });
      setEmail(data.email);
      setIsValidating(false);
    };

    validateToken();
  }, [inviteToken, isAuthenticated, navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = adminSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (authData.user) {
        // Update user role to admin
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert([{ user_id: authData.user.id, role: 'admin' }], { 
            onConflict: 'user_id' 
          });
        
        if (roleError) {
          console.error('Error setting admin role:', roleError);
        }

        // Mark invitation as used
        if (inviteToken) {
          await supabase
            .from('admin_invitations')
            .update({ used: true })
            .eq('token', inviteToken);
        }
        
        toast({
          title: 'Admin Account Created',
          description: 'Your administrator account has been created successfully.',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!inviteToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Registration</h1>
          <p className="text-muted-foreground mb-6">
            You need an invitation link from an existing administrator to register as an admin.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={agileLogo}
              alt="AGILE Logo"
              className="h-24 w-24 rounded-full bg-white mb-8 shadow-lg"
            />
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Administrator Setup</h1>
            </div>
            <p className="text-lg opacity-90 max-w-md">
              Create your administrator account to manage the AGILE Monthly Activity Tracking System.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img
              src={agileLogo}
              alt="AGILE Logo"
              className="h-16 w-16 rounded-full shadow-md mb-4"
            />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Admin Registration</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Create Admin Account
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Set up your administrator credentials
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Administrator Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                className={`h-11 ${errors.fullName ? 'border-destructive' : ''}`}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@agile.gov.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || !!invitation}
                className={`h-11 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
              {invitation && (
                <p className="text-xs text-muted-foreground">
                  Email is locked to invitation
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`h-11 ${errors.password ? 'border-destructive' : ''}`}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className={`h-11 ${errors.confirmPassword ? 'border-destructive' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-sm text-primary hover:underline"
            >
              Already have an account? Sign in
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
