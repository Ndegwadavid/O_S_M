// frontend/src/components/clients/ClientRegistration.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { clientApi } from '../../services/api';

const ClientRegistration = () => {
  // State management for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    areaOfResidence: '',
    previousRx: ''
  });

  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  // Fetch next client ID using React Query
  const { data: clientIdData, isLoading: isLoadingId } = useQuery({
    queryKey: ['nextClientId'],
    queryFn: clientApi.getNextClientId,
    refetchOnWindowFocus: false
  });

  // Mutation for client registration
  const registerMutation = useMutation({
    mutationFn: clientApi.registerClient,
    onSuccess: (data) => {
      showNotification('Client registered successfully', 'success');
      queryClient.invalidateQueries('nextClientId');
      resetForm();
    },
    onError: (error) => {
      showNotification(`Registration failed: ${error.message}`, 'error');
    }
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientIdData?.nextId) {
      showNotification('Cannot get client ID', 'error');
      return;
    }

    registerMutation.mutate({
      ...formData,
      id: clientIdData.nextId
    });
  };

  // Reset form after successful registration
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      phone: '',
      areaOfResidence: '',
      previousRx: ''
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Client Registration</CardTitle>
        {clientIdData?.nextId && (
          <div className="text-sm text-gray-500">
            Registration Number: {clientIdData.nextId}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john.doe@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+254 123 456789"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="areaOfResidence">Area of Residence</Label>
            <Input
              id="areaOfResidence"
              name="areaOfResidence"
              value={formData.areaOfResidence}
              onChange={handleInputChange}
              required
              placeholder="City, Area"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousRx">Previous Prescription (if any)</Label>
            <Input
              id="previousRx"
              name="previousRx"
              value={formData.previousRx}
              onChange={handleInputChange}
              placeholder="Previous prescription details"
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={registerMutation.isPending || isLoadingId}
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register Client'
            )}
          </Button>

          {/* Error Display */}
          {registerMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {registerMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientRegistration;