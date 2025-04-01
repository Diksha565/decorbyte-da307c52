
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Razorpay configuration
const KEY_ID = 'rzp_test_12VtBiGpqRmgnp';

// Load the Razorpay script dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

export interface RazorpayOrderOptions {
  amount: number;
  currency?: string;
  name: string;
  description?: string;
  orderId?: string;
  email?: string;
  contact?: string;
  prefillData?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

// Initialize and open Razorpay payment
export const initiatePayment = async (options: RazorpayOrderOptions): Promise<any> => {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: KEY_ID,
      amount: options.amount * 100, // Razorpay expects amount in paise
      currency: options.currency || 'INR',
      name: options.name,
      description: options.description || 'Purchase',
      order_id: options.orderId, // This would come from your backend
      prefill: options.prefillData || {},
      handler: (response: any) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    try {
      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.open();
    } catch (error) {
      reject(error);
    }
  });
};

// Create a server-side order
export const createRazorpayOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string = 'order_receipt'
): Promise<string> => {
  // In a real app, you'd call your backend to create an order with Razorpay
  // For this demo, we'll simulate an order ID
  return `order_${Date.now()}`;
};

// Process payment status (would be verified on backend)
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  // In a real app, you'd verify this with your backend
  return true;
};
