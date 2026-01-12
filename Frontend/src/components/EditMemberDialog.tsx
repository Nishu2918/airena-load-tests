import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Member } from './MembersTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
  onSave: (member: Member) => void;
}

export function EditMemberDialog({ open, onOpenChange, member, onSave }: EditMemberDialogProps) {
  const [formData, setFormData] = useState({
    name: member.name,
    phone: member.phone,
    amountToBePaid: member.amountToBePaid.toString(),
    paymentMethod: member.paymentMethod,
    amountPaid: member.amountPaid.toString(),
    transactionDetails: member.transactionDetails,
    dateOfPayment: member.dateOfPayment,
    dueDate: member.dueDate,
    modeOfPayment: member.modeOfPayment,
    sendNotification: false
  });

  useEffect(() => {
    setFormData({
      name: member.name,
      phone: member.phone,
      amountToBePaid: member.amountToBePaid.toString(),
      paymentMethod: member.paymentMethod,
      amountPaid: member.amountPaid.toString(),
      transactionDetails: member.transactionDetails,
      dateOfPayment: member.dateOfPayment,
      dueDate: member.dueDate,
      modeOfPayment: member.modeOfPayment,
      sendNotification: false
    });
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountToBePaid = parseFloat(formData.amountToBePaid) || 0;
    const amountPaid = parseFloat(formData.amountPaid) || 0;
    const dueAmount = amountToBePaid - amountPaid;
    
    let status: 'paid' | 'unpaid' | 'partial';
    if (amountPaid === 0) {
      status = 'unpaid';
    } else if (amountPaid >= amountToBePaid) {
      status = 'paid';
    } else {
      status = 'partial';
    }

    const updatedMember: Member = {
      ...member,
      name: formData.name,
      phone: formData.phone,
      amountToBePaid,
      paymentMethod: formData.paymentMethod,
      amountPaid,
      dueAmount,
      transactionDetails: formData.transactionDetails,
      dateOfPayment: formData.dateOfPayment,
      dueDate: formData.dueDate,
      modeOfPayment: formData.modeOfPayment,
      status
    };

    onSave(updatedMember);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        
        <div 
          className="overflow-y-auto flex-1 -mx-6 px-6 min-h-0"
          data-scrollable
          style={{ maxHeight: 'calc(90vh - 120px)', WebkitOverflowScrolling: 'touch' }}
        >
          <form id="edit-member-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter member name"
              />
            </div>

            <div>
              <Label htmlFor="edit-phone">Phone Number *</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                required
                placeholder="Enter 10-digit number"
                maxLength={10}
              />
            </div>

            <div>
              <Label htmlFor="edit-amountToBePaid">Amount to be Paid *</Label>
              <Input
                id="edit-amountToBePaid"
                type="number"
                value={formData.amountToBePaid}
                onChange={(e) => setFormData({ ...formData, amountToBePaid: e.target.value })}
                required
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="edit-paymentMethod">Payment Method *</Label>
              <Select 
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-amountPaid">Amount Paid</Label>
              <Input
                id="edit-amountPaid"
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                placeholder="Enter amount paid"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="edit-modeOfPayment">Mode of Payment</Label>
              <Select 
                value={formData.modeOfPayment}
                onValueChange={(value) => setFormData({ ...formData, modeOfPayment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-transactionDetails">Transaction Details</Label>
              <Input
                id="edit-transactionDetails"
                value={formData.transactionDetails}
                onChange={(e) => setFormData({ ...formData, transactionDetails: e.target.value })}
                placeholder="Transaction ID or reference"
              />
            </div>

            <div>
              <Label htmlFor="edit-dateOfPayment">Date of Payment</Label>
              <Input
                id="edit-dateOfPayment"
                type="date"
                value={formData.dateOfPayment}
                onChange={(e) => setFormData({ ...formData, dateOfPayment: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-dueDate">Due Date *</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-sendNotification"
              checked={formData.sendNotification}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, sendNotification: checked as boolean })
              }
            />
            <Label htmlFor="edit-sendNotification" className="cursor-pointer">
              Send notification/reminder to member (Dummy)
            </Label>
          </div>

          </form>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 flex-shrink-0 border-t border-slate-700 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-2 border-slate-600 hover:bg-slate-800 text-white"
          >
              Cancel
            </Button>
            <Button 
              type="submit"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
            >
              Save Changes
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
