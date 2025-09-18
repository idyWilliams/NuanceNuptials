import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Lock, CreditCard, Shield } from "lucide-react";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder");

// Mock cart items for demonstration
const mockCartItems = [
  {
    id: "1",
    name: "Stand Mixer Contribution",
    description: "Group gift toward Sarah & Michael's registry",
    amount: 25.00,
    type: "contribution",
  },
  {
    id: "2", 
    name: "Dinnerware Set Contribution",
    description: "Group gift toward Sarah & Michael's registry",
    amount: 50.00,
    type: "contribution",
  },
  {
    id: "3",
    name: "Romantic Getaway Fund",
    description: "Experience fund contribution",
    amount: 100.00,
    type: "contribution",
  },
];

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [savePayment, setSavePayment] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms of service to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
        receipt_email: email,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful", 
        description: "Thank you for your contribution!",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          data-testid="input-email"
        />
      </div>

      <div>
        <Label>Payment Information</Label>
        <div className="mt-2 p-4 border border-border rounded-lg bg-background">
          <PaymentElement />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="save-payment"
            checked={savePayment}
            onCheckedChange={(checked) => setSavePayment(checked as boolean)}
            data-testid="checkbox-save-payment"
          />
          <Label htmlFor="save-payment" className="text-sm">
            Save payment information for future purchases
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agree-terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            data-testid="checkbox-agree-terms"
          />
          <Label htmlFor="agree-terms" className="text-sm">
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm text-muted-foreground mb-3">We accept</p>
        <div className="flex items-center space-x-4">
          <div className="px-3 py-2 border border-border rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div className="px-3 py-2 border border-border rounded-lg">
            <CreditCard className="h-6 w-6 text-red-600" />
          </div>
          <div className="px-3 py-2 border border-border rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full text-lg font-semibold shadow-lg"
        disabled={!stripe || isProcessing}
        data-testid="button-complete-payment"
      >
        <Lock className="h-4 w-4 mr-2" />
        {isProcessing ? "Processing..." : "Complete Secure Payment"}
      </Button>

      <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>
    </form>
  );
};

export default function Checkout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Create payment intent
  const createPaymentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount,
        metadata: {
          userId: user?.id,
          items: JSON.stringify(mockCartItems.map(item => ({ id: item.id, name: item.name }))),
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Calculate total amount
      const totalAmount = mockCartItems.reduce((sum, item) => sum + item.amount, 0) + 2.95; // Add processing fee
      createPaymentMutation.mutate(totalAmount);
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background" data-testid="checkout-loading">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.amount, 0);
  const processingFee = 2.95;
  const total = subtotal + processingFee;

  return (
    <div className="min-h-screen bg-muted/30" data-testid="checkout-page">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-secondary mb-2" data-testid="text-checkout-title">
            Secure Checkout
          </h1>
          <p className="text-lg text-muted-foreground">
            Safe and simple payment processing with multiple options.
          </p>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-secondary">Order Summary</h3>
                
                <div className="space-y-4">
                  {mockCartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div>
                          <p className="font-medium" data-testid={`text-item-name-${item.id}`}>
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold" data-testid={`text-item-amount-${item.id}`}>
                        ${item.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 py-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span data-testid="text-processing-fee">${processingFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-secondary pt-2">
                    <span>Total</span>
                    <span data-testid="text-total">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment Form */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-secondary">Payment Information</h3>
                
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm clientSecret={clientSecret} />
                </Elements>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
