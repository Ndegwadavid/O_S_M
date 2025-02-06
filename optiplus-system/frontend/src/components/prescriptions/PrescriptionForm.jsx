// frontend/src/components/prescriptions/PrescriptionForm.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { prescriptionApi } from '../../services/api';
import { clientApi } from '../../services/api';

const PrescriptionForm = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotifications();

  // States for client search and selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // State for prescription data
  const [prescription, setPrescription] = useState({
    right: {
      sph: '',
      cyl: '',
      axi: '',
      add: '',
      va: ''
    },
    left: {
      sph: '',
      cyl: '',
      axi: '',
      add: '',
      va: ''
    },
    ipd: '',
    clinicalHistory: '',
    examinedBy: '' // Added examiner field
  });

  // Client search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['clientSearch', searchQuery],
    queryFn: () => clientApi.searchClients(searchQuery),
    enabled: searchQuery.length > 2,
    staleTime: 5000
  });

  // Prescription mutation
  const prescriptionMutation = useMutation({
    mutationFn: prescriptionApi.createPrescription,
    onSuccess: () => {
      showNotification('Prescription saved successfully', 'success');
      queryClient.invalidateQueries(['prescriptions', selectedClient?.id]);
      resetForm();
    },
    onError: (error) => {
      showNotification(`Failed to save prescription: ${error.message}`, 'error');
    }
  });

  // Handle input changes for prescription data
  const handleInputChange = (eye, field, value) => {
    setPrescription(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value
      }
    }));
  };

  // Handle client selection
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setSearchQuery('');
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient) {
      showNotification('Please select a client first', 'error');
      return;
    }

    prescriptionMutation.mutate({
      clientId: selectedClient.id,
      ...prescription
    });
  };

  // Reset form
  const resetForm = () => {
    setPrescription({
      right: { sph: '', cyl: '', axi: '', add: '', va: '' },
      left: { sph: '', cyl: '', axi: '', add: '', va: '' },
      ipd: '',
      clinicalHistory: '',
      examinedBy: ''
    });
    setSelectedClient(null);
  };

  // Render eye fields (right/left)
  const renderEyeFields = (eye) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{eye.toUpperCase()}</h3>
      <div className="grid grid-cols-5 gap-2">
        {['sph', 'cyl', 'axi', 'add', 'va'].map((field) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={`${eye}-${field}`}>{field.toUpperCase()}</Label>
            <Input
              id={`${eye}-${field}`}
              value={prescription[eye][field]}
              onChange={(e) => handleInputChange(eye, field, e.target.value)}
              className="w-full"
              placeholder="0.00"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Prescription Form</CardTitle>
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
            <div className="mt-2 p-2 bg-gray-50 rounded-md">
              Selected Client: {selectedClient.firstName} {selectedClient.lastName} ({selectedClient.id})
            </div>
          )}
        </div>

        {/* Prescription Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderEyeFields('right')}
          {renderEyeFields('left')}
          
          <div className="space-y-2">
            <Label htmlFor="ipd">IPD</Label>
            <Input
              id="ipd"
              value={prescription.ipd}
              onChange={(e) => setPrescription(prev => ({
                ...prev,
                ipd: e.target.value
              }))}
              className="w-32"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examinedBy">Examined By</Label>
            <Input
              id="examinedBy"
              value={prescription.examinedBy}
              onChange={(e) => setPrescription(prev => ({
                ...prev,
                examinedBy: e.target.value
              }))}
              placeholder="Doctor's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalHistory">Clinical History</Label>
            <Textarea
              id="clinicalHistory"
              value={prescription.clinicalHistory}
              onChange={(e) => setPrescription(prev => ({
                ...prev,
                clinicalHistory: e.target.value
              }))}
              className="h-32"
              placeholder="Enter clinical history and notes..."
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={prescriptionMutation.isPending || !selectedClient}
          >
            {prescriptionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Prescription...
              </>
            ) : (
              'Save Prescription'
            )}
          </Button>

          {prescriptionMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                {prescriptionMutation.error.message}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PrescriptionForm;