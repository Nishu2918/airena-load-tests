import { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export interface Member {
  id: string;
  name: string;
  phone: string;
  amountToBePaid: number;
  amountPaid: number;
  dueDate: string;
  paymentMethod: string;
}

interface WhatsAppTemplateProps {
  member: Member;
  businessName: string;
  onClose: () => void;
}

// Template 1: Payment Completed
export function PaymentCompletedTemplate({ member, businessName, onClose }: WhatsAppTemplateProps) {
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const message = `*💰 Payment Confirmation - ${businessName}*

Hello ${member.name},

Thank you for your payment! This is to confirm that we have received your payment successfully.

📋 *Payment Details:*
• Amount Due: ₹${member.amountToBePaid.toLocaleString('en-IN')}
• Total Amount: ₹${member.amountToBePaid.toLocaleString('en-IN')}
• Amount Paid: ₹${member.amountPaid.toLocaleString('en-IN')}
• Payment Date: ${formatDate(member.dueDate)}
• Status: ✅ *Paid*

💳 *Payment Method:* ${member.paymentMethod}

Your payment has been successfully recorded in our system. You can view your complete payment history anytime.

For any queries, please contact us.

_Thank you, ${businessName}_
${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <>
      <Card className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-white border-green-200">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-t-lg">
          <h3 className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Payment Completed Template
          </h3>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
            <div className="text-gray-900 mb-3">payment details</div>
            <div className="text-gray-800 mb-3">
              <span className="text-green-600">✅</span> Payment Confirmation - {businessName}
            </div>
            
            <div className="space-y-2 text-gray-700 whitespace-pre-line mb-4">
              {message.split('\n').map((line, i) => (
                <div key={i} className={line.startsWith('*') && line.endsWith('*') ? '' : ''}>
                  {line.replace(/\*/g, '')}
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowPaymentStatus(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              👁️ View Payment Status
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${member.phone}?text=${encodedMessage}`, '_blank');
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Send via WhatsApp
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Status Dialog */}
      <Dialog open={showPaymentStatus} onOpenChange={setShowPaymentStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-green-600 mb-2">Payment Completed</h3>
                <p className="text-gray-600">All dues cleared</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Name:</span>
                <span className="text-gray-900">{member.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-gray-900">₹{member.amountToBePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-green-600">₹{member.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Amount:</span>
                <span className="text-gray-900">₹0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Paid
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Template 2: Payment Pending
export function PaymentPendingTemplate({ member, businessName, onClose }: WhatsAppTemplateProps) {
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  
  const dueAmount = member.amountToBePaid - member.amountPaid;
  const dueDate = new Date(member.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const message = `*⚠️ Payment Reminder - ${businessName}*

Hello ${member.name},

This is a reminder regarding your pending payment.

📋 *Payment Details:*
• Amount Due: ₹${dueAmount.toLocaleString('en-IN')}
• Total Amount: ₹${member.amountToBePaid.toLocaleString('en-IN')}
• Amount Paid: ₹${member.amountPaid.toLocaleString('en-IN')}
• Due Date: ${formatDate(member.dueDate)}
• Days Until Due: ${daysUntilDue} days

💳 *Payment Method:* ${member.paymentMethod}

Please make the payment at your earliest convenience to avoid any inconvenience.

*Click here to pay:* https://pay.example.com/${member.id}

For any queries, please contact us.

_Thank you, ${businessName}_
${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <>
      <Card className="max-w-md mx-auto bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-4 rounded-t-lg">
          <h3 className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Payment Pending Template
          </h3>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
            <div className="text-gray-900 mb-3">payment details</div>
            <div className="text-gray-800 mb-3">
              <span className="text-yellow-600">⚠️</span> Payment Reminder - {businessName}
            </div>
            
            <div className="space-y-2 text-gray-700 whitespace-pre-line mb-4">
              {message.split('\n').map((line, i) => (
                <div key={i}>
                  {line.replace(/\*/g, '')}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  // Simulate UPI payment redirect
                  const upiLink = `upi://pay?pa=merchant@upi&pn=${encodeURIComponent(businessName)}&am=${dueAmount}&cu=INR&tn=Payment%20for%20${encodeURIComponent(member.name)}`;
                  
                  // Create payment options dialog
                  const paymentChoice = window.confirm(
                    'Choose payment method:\n\nClick OK for UPI Apps (GPay, PhonePe, Paytm)\nClick Cancel to copy UPI ID'
                  );
                  
                  if (paymentChoice) {
                    window.open(upiLink, '_blank');
                  } else {
                    navigator.clipboard.writeText('merchant@upi');
                    alert('UPI ID copied to clipboard: merchant@upi');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                💰 Click Here to Pay
              </Button>

              <Button
                onClick={() => setShowPaymentStatus(true)}
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                👁️ View Payment Status
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${member.phone}?text=${encodedMessage}`, '_blank');
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Send via WhatsApp
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Status Dialog */}
      <Dialog open={showPaymentStatus} onOpenChange={setShowPaymentStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-yellow-600 mb-2">Payment Pending</h3>
                <p className="text-gray-600">{daysUntilDue} days until due date</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Name:</span>
                <span className="text-gray-900">{member.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-gray-900">₹{member.amountToBePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-green-600">₹{member.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Amount:</span>
                <span className="text-red-600">₹{dueAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="text-gray-900">{formatDate(member.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-yellow-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Pending
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Template 3: Partial Payment
export function PartialPaymentTemplate({ member, businessName, onClose }: WhatsAppTemplateProps) {
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  
  const dueAmount = member.amountToBePaid - member.amountPaid;
  const dueDate = new Date(member.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const message = `*🔔 Partial Payment Reminder - ${businessName}*

Hello ${member.name},

We have received your partial payment. Thank you! However, there is still a remaining balance.

📋 *Payment Details:*
• Amount Due: ₹${dueAmount.toLocaleString('en-IN')}
• Total Amount: ₹${member.amountToBePaid.toLocaleString('en-IN')}
• Amount Paid: ₹${member.amountPaid.toLocaleString('en-IN')}
• Remaining Balance: ₹${dueAmount.toLocaleString('en-IN')}
• Due Date: ${formatDate(member.dueDate)}
• Days Until Due: ${daysUntilDue} days

💳 *Payment Method:* ${member.paymentMethod}

Please complete the remaining payment at your earliest convenience.

*Click here to pay remaining amount:* https://pay.example.com/${member.id}

For any queries, please contact us.

_Thank you, ${businessName}_
${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <>
      <Card className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
          <h3 className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Partial Payment Template
          </h3>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
            <div className="text-gray-900 mb-3">payment details</div>
            <div className="text-gray-800 mb-3">
              <span className="text-blue-600">🔔</span> Partial Payment Reminder - {businessName}
            </div>
            
            <div className="space-y-2 text-gray-700 whitespace-pre-line mb-4">
              {message.split('\n').map((line, i) => (
                <div key={i}>
                  {line.replace(/\*/g, '')}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  const upiLink = `upi://pay?pa=merchant@upi&pn=${encodeURIComponent(businessName)}&am=${dueAmount}&cu=INR&tn=Remaining%20Payment%20for%20${encodeURIComponent(member.name)}`;
                  
                  const paymentChoice = window.confirm(
                    'Choose payment method:\n\nClick OK for UPI Apps (GPay, PhonePe, Paytm)\nClick Cancel to copy UPI ID'
                  );
                  
                  if (paymentChoice) {
                    window.open(upiLink, '_blank');
                  } else {
                    navigator.clipboard.writeText('merchant@upi');
                    alert('UPI ID copied to clipboard: merchant@upi');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                💰 Click Here to Pay Remaining Amount
              </Button>

              <Button
                onClick={() => setShowPaymentStatus(true)}
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                👁️ View Payment Status
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${member.phone}?text=${encodedMessage}`, '_blank');
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Send via WhatsApp
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Status Dialog */}
      <Dialog open={showPaymentStatus} onOpenChange={setShowPaymentStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-blue-600 mb-2">Partial Payment</h3>
                <p className="text-gray-600">Remaining balance due</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Name:</span>
                <span className="text-gray-900">{member.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-gray-900">₹{member.amountToBePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-green-600">₹{member.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Amount:</span>
                <span className="text-red-600">₹{dueAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="text-gray-900">{formatDate(member.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-blue-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Partial
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Template 4: Overdue Payment
export function OverduePaymentTemplate({ member, businessName, onClose }: WhatsAppTemplateProps) {
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  
  const dueAmount = member.amountToBePaid - member.amountPaid;
  const dueDate = new Date(member.dueDate);
  const today = new Date();
  const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const message = `*🚨 URGENT: Payment Overdue - ${businessName}*

Hello ${member.name},

This is an urgent reminder that your payment is now OVERDUE.

📋 *Payment Details:*
• Amount Due: ₹${dueAmount.toLocaleString('en-IN')}
• Total Amount: ₹${member.amountToBePaid.toLocaleString('en-IN')}
• Amount Paid: ₹${member.amountPaid.toLocaleString('en-IN')}
• Due Date: ${formatDate(member.dueDate)}
• Days Overdue: ${daysOverdue} days ⚠️

💳 *Payment Method:* ${member.paymentMethod}

⚠️ *IMPORTANT:* Please make the payment immediately to avoid any late fees or service interruption.

*Click here to pay NOW:* https://pay.example.com/${member.id}

For any queries or payment assistance, please contact us immediately.

_Thank you, ${businessName}_
${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <>
      <Card className="max-w-md mx-auto bg-gradient-to-br from-red-50 to-white border-red-200">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 rounded-t-lg">
          <h3 className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Overdue Payment Template
          </h3>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200 mb-4">
            <div className="text-gray-900 mb-3">payment details</div>
            <div className="text-gray-800 mb-3">
              <span className="text-red-600">🚨</span> URGENT: Payment Overdue - {businessName}
            </div>
            
            <div className="space-y-2 text-gray-700 whitespace-pre-line mb-4">
              {message.split('\n').map((line, i) => (
                <div key={i} className={line.includes('URGENT') || line.includes('IMPORTANT') ? 'text-red-600' : ''}>
                  {line.replace(/\*/g, '')}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  const upiLink = `upi://pay?pa=merchant@upi&pn=${encodeURIComponent(businessName)}&am=${dueAmount}&cu=INR&tn=Overdue%20Payment%20for%20${encodeURIComponent(member.name)}`;
                  
                  const paymentChoice = window.confirm(
                    'Choose payment method:\n\nClick OK for UPI Apps (GPay, PhonePe, Paytm)\nClick Cancel to copy UPI ID'
                  );
                  
                  if (paymentChoice) {
                    window.open(upiLink, '_blank');
                  } else {
                    navigator.clipboard.writeText('merchant@upi');
                    alert('UPI ID copied to clipboard: merchant@upi');
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white animate-pulse"
              >
                🚨 Click Here to Pay NOW
              </Button>

              <Button
                onClick={() => setShowPaymentStatus(true)}
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                👁️ View Payment Status
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${member.phone}?text=${encodedMessage}`, '_blank');
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Send via WhatsApp
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Status Dialog */}
      <Dialog open={showPaymentStatus} onOpenChange={setShowPaymentStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-red-600 mb-2">Payment Overdue</h3>
                <p className="text-gray-600">{daysOverdue} days past due date</p>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 space-y-2 border border-red-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Name:</span>
                <span className="text-gray-900">{member.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-gray-900">₹{member.amountToBePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-green-600">₹{member.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Amount:</span>
                <span className="text-red-600">₹{dueAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="text-gray-900">{formatDate(member.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Overdue:</span>
                <span className="text-red-600">{daysOverdue} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Overdue
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
