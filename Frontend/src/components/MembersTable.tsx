import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Edit,
  Bell,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { AddMemberDialog } from './AddMemberDialog';
import { EditMemberDialog } from './EditMemberDialog';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';

export type Member = {
  id: string;
  name: string;
  phone: string;
  amountToBePaid: number;
  paymentMethod: string;
  amountPaid: number;
  dueAmount: number;
  transactionDetails: string;
  dateOfPayment: string;
  dueDate: string;
  modeOfPayment: string;
  status: 'paid' | 'unpaid' | 'partial';
};

interface MembersTableProps {
  businessName: string;
  onNotification: (message: string) => void;
}

export function MembersTable({ businessName, onNotification }: MembersTableProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  useEffect(() => {
    // Load members from localStorage
    const storedMembers = localStorage.getItem('members');
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }
  }, []);

  const saveMembers = (updatedMembers: Member[]) => {
    setMembers(updatedMembers);
    localStorage.setItem('members', JSON.stringify(updatedMembers));
  };

  const handleAddMember = (member: Omit<Member, 'id'>) => {
    const newMember = {
      ...member,
      id: Date.now().toString()
    };
    const updatedMembers = [...members, newMember];
    saveMembers(updatedMembers);
    toast.success('Member added successfully!');
  };

  const handleEditMember = (member: Member) => {
    const updatedMembers = members.map(m => m.id === member.id ? member : m);
    saveMembers(updatedMembers);
    setEditingMember(null);
    setEditDialogOpen(false);
    toast.success('Member updated successfully!');
  };

  const handleDeleteMember = (id: string) => {
    const updatedMembers = members.filter(m => m.id !== id);
    saveMembers(updatedMembers);
    toast.success('Member deleted successfully!');
  };

  const handleSendReminder = (member: Member) => {
    // Dummy notification
    toast.success(`Reminder sent to ${member.name}`, {
      description: `WhatsApp notification sent to ${member.phone}`
    });
    onNotification(`Reminder sent to ${member.name}`);
  };

  const handlePrintSlip = (member: Member) => {
    // Create a print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Slip - ${member.name}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .business-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .slip-title { font-size: 18px; color: #666; }
              .details { margin: 20px 0; }
              .row { display: flex; margin: 10px 0; }
              .label { font-weight: bold; width: 200px; }
              .value { flex: 1; }
              .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
              .paid-stamp { color: green; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="business-name">${businessName}</div>
              <div class="slip-title">Payment Receipt</div>
            </div>
            <div class="details">
              <div class="row"><span class="label">Receipt No:</span><span class="value">#${member.id}</span></div>
              <div class="row"><span class="label">Member Name:</span><span class="value">${member.name}</span></div>
              <div class="row"><span class="label">Phone:</span><span class="value">${member.phone}</span></div>
              <div class="row"><span class="label">Amount to be Paid:</span><span class="value">₹${member.amountToBePaid}</span></div>
              <div class="row"><span class="label">Amount Paid:</span><span class="value">₹${member.amountPaid}</span></div>
              <div class="row"><span class="label">Due Amount:</span><span class="value">₹${member.dueAmount}</span></div>
              <div class="row"><span class="label">Payment Date:</span><span class="value">${member.dateOfPayment || 'N/A'}</span></div>
              <div class="row"><span class="label">Mode of Payment:</span><span class="value">${member.modeOfPayment}</span></div>
              <div class="row"><span class="label">Transaction ID:</span><span class="value">${member.transactionDetails}</span></div>
            </div>
            ${member.status === 'paid' ? '<div class="paid-stamp">✓ PAID</div>' : ''}
            <div class="footer">
              This is a computer-generated receipt. Generated on ${new Date().toLocaleDateString()}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExportMember = (member: Member) => {
    const worksheet = XLSX.utils.json_to_sheet([{
      'Sl. No': members.indexOf(member) + 1,
      'Name': member.name,
      'Phone': member.phone,
      'Amount to be Paid': member.amountToBePaid,
      'Payment Method': member.paymentMethod,
      'Amount Paid': member.amountPaid,
      'Due Amount': member.dueAmount,
      'Transaction Details': member.transactionDetails,
      'Date of Payment': member.dateOfPayment,
      'Due Date': member.dueDate,
      'Mode of Payment': member.modeOfPayment,
      'Status': member.status
    }]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Member');
    XLSX.writeFile(workbook, `${member.name}_details.xlsx`);
    toast.success('Member data exported to Excel!');
  };

  const handleExportAll = () => {
    const filteredData = getFilteredMembers();
    const exportData = filteredData.map((member, index) => ({
      'Sl. No': index + 1,
      'Name': member.name,
      'Phone': member.phone,
      'Amount to be Paid': member.amountToBePaid,
      'Payment Method': member.paymentMethod,
      'Amount Paid': member.amountPaid,
      'Due Amount': member.dueAmount,
      'Transaction Details': member.transactionDetails,
      'Date of Payment': member.dateOfPayment,
      'Due Date': member.dueDate,
      'Mode of Payment': member.modeOfPayment,
      'Status': member.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    XLSX.writeFile(workbook, `${businessName}_members_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('All member data exported to Excel!');
  };

  const getFilteredMembers = () => {
    return members.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery);
      
      const matchesFilter = 
        filterStatus === 'all' || member.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  };

  const filteredMembers = getFilteredMembers();

  const stats = {
    total: members.length,
    paid: members.filter(m => m.status === 'paid').length,
    unpaid: members.filter(m => m.status === 'unpaid').length,
    partial: members.filter(m => m.status === 'partial').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-2">Member Management</h2>
          <p className="text-gray-600">
            Manage and track all member payments
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600">Total Members</p>
                <p className="text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600">Paid</p>
                <p className="text-gray-900">{stats.paid}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600">Unpaid</p>
                <p className="text-gray-900">{stats.unpaid}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600">Partial</p>
                <p className="text-gray-900">{stats.partial}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('paid')}>
                Paid Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('unpaid')}>
                Unpaid Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('partial')}>
                Partial Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleExportAll} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Sl. No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Amount to be Paid</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-12">
                    <div className="text-gray-500">
                      {searchQuery || filterStatus !== 'all' 
                        ? 'No members found matching your criteria' 
                        : 'No members added yet. Click "Add New Member" to get started.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member, index) => (
                  <TableRow key={member.id} className="hover:bg-gray-50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>₹{member.amountToBePaid}</TableCell>
                    <TableCell>{member.paymentMethod}</TableCell>
                    <TableCell>₹{member.amountPaid}</TableCell>
                    <TableCell>₹{member.dueAmount}</TableCell>
                    <TableCell>{member.transactionDetails || '-'}</TableCell>
                    <TableCell>{member.dateOfPayment || '-'}</TableCell>
                    <TableCell>{member.dueDate}</TableCell>
                    <TableCell>{member.modeOfPayment}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          member.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : member.status === 'unpaid'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrintSlip(member)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingMember(member);
                              setEditDialogOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(member)}>
                              <Bell className="w-4 h-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportMember(member)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialogs */}
      <AddMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddMember}
      />

      {editingMember && (
        <EditMemberDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          member={editingMember}
          onSave={handleEditMember}
        />
      )}
    </div>
  );
}
