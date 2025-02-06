// frontend/src/components/sales/SalesOrder.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { salesApi, clientApi, prescriptionApi } from '../../services/api';

const SalesOrder = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [orderDetails, setOrderDetails] = useState({
    brand: '',
    model: '',
    color: '',
    quantity: 1,
    amount: '',
    advance: '',
    fittingInstructions: '',
    orderBookedBy: '',
    deliveryDate: '',
    status: 'pending_collection'
  });

  // Calculate derived values
  const total = parseFloat(orderDetails.amount * orderDetails.quantity) || 0;
  const balance = total - (parseFloat(orderDetails.advance) || 0);

  // Client search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['clientSearch', searchQuery],
    queryFn: () => clientApi.searchClients(searchQuery),
    enabled: searchQuery.length > 2
  });

  // Get client's latest prescription
  const { data: prescriptionData } = useQuery({
    queryKey: ['latestPrescription', selectedClient?.id],
    queryFn: () => prescriptionApi.getLatestPrescription(selectedClient.id),
    enabled: !!selectedClient,
    onSuccess: (data) => {
      setSelectedPrescription(data.prescription);
    }
  });

  // Sales order mutation
  const salesMutation = useMutation({
    mutationFn: salesApi.createSalesOrder,
    onSuccess: (data) => {
      showNotification('Sales order created successfully', 'success');
      queryClient.invalidateQueries(['sales']);
      resetForm();
    },
    onError: (error) => {
      showNotification(`Failed to create sales order: ${error.message}`, 'error');
    }
  });

  // Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setSearchQuery('');
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setOrderDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient || !selectedPrescription) {
      showNotification('Please select a client and ensure prescription exists', 'error');
      return;
    }

    salesMutation.mutate({
      clientId: selectedClient.id,
      prescriptionId: selectedPrescription.id,
      ...orderDetails,
      total,
      balance
    });
  };

  // Reset form
  const resetForm = () => {
    setSelectedClient(null);
    setSelectedPrescription(null);
    setOrderDetails({
      brand: '',
      model: '',
      color: '',
      quantity: 1,
      amount: '',
      advance: '',
      fittingInstructions: '',
      orderBookedBy: '',
      deliveryDate: '',
      status: 'pending_collection'
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Sales Order</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Client Search Section */}
        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Search client by ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Results */}
          {searchResults?.clients?.length > 0 && (
            <div className="border rounded-md mt-2 max-h-40 overflow-y-auto">
              {searchResults.clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {client.id} - {client.firstName} {client.lastName}
                </div>
              ))}
            </div>
          )}

          {/* Selected Client Display */}
          {selectedClient && (
            <div className="mt-2 p-2 bg-gray-50 rounded-md space-y-2">
              <div>
                Selected Client: {selectedClient.firstName} {selectedClient.lastName} ({selectedClient.id})
              </div>
              {selectedPrescription && (
                <div className="text-sm text-gray-600">
                  Latest Prescription Date: {new Date(selectedPrescription.examDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={orderDetails.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={orderDetails.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={orderDetails.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quantity and Amount */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={orderDetails.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={orderDetails.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advance">Advance Payment</Label>
              <Input
                id="advance"
                type="number"
                step="0.01"
                value={orderDetails.advance}
                onChange={(e) => handleInputChange('advance', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Total and Balance Display */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
            <div>
              <Label>Total Amount</Label>
              <div className="text-lg font-semibold">{total.toFixed(2)}</div>
            </div>
            <div>
              <Label>Balance</Label>
              <div className="text-lg font-semibold">{balance.toFixed(2)}</div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="fittingInstructions">Fitting Instructions</Label>
            <Input
              id="fittingInstructions"
              value={orderDetails.fittingInstructions}
              onChange={(e) => handleInputChange('fittingInstructions', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderBookedBy">Order Booked By</Label>
              <Input
                id="orderBookedBy"
                value={orderDetails.orderBookedBy}
                onChange={(e) => handleInputChange('orderBookedBy', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={orderDetails.deliveryDate}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={orderDetails.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending_collection">Pending Collection</SelectItem>
                <SelectItem value="pending_job">Pending Job</SelectItem>
                <SelectItem value="job_complete">Job Complete</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={salesMutation.isPending || !selectedClient || !selectedPrescription}
          >
            {salesMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              'Create Sales Order'
            )}
          </Button>

          {salesMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {salesMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default SalesOrder;