import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const SalesForm = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Watch amount and quantity for automatic calculations
  const amount = watch('amount', 0);
  const quantity = watch('quantity', 1);
  const advance = watch('advance', 0);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/clients/${clientId}`);
        setClient(response.data);
      } catch (error) {
        console.error('Error fetching client:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  // Calculate total and balance
  useEffect(() => {
    const total = Number(amount) * Number(quantity);
    setValue('total', total);
    setValue('balance', total - Number(advance));
  }, [amount, quantity, advance, setValue]);

  const onSubmit = async (data) => {
    try {
      await axios.post(`http://localhost:5000/api/sales/${clientId}`, data);
      navigate('/reception/pending');
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Process Sale</h2>
        <p className="text-gray-600">
          Client: {client?.first_name} {client?.last_name} ({client?.reg_number})
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              {...register('brand', { required: 'Brand is required' })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              {...register('model', { required: 'Model is required' })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="text"
              {...register('color')}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              {...register('quantity', { required: true, min: 1 })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              {...register('amount', { required: true, min: 0 })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total</label>
            <input
              type="number"
              {...register('total')}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Advance Payment</label>
            <input
              type="number"
              {...register('advance', { required: true, min: 0 })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Balance</label>
            <input
              type="number"
              {...register('balance')}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            />
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fitting Instructions
          </label>
          <textarea
            {...register('fittingInstructions')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delivery Date
          </label>
          <input
            type="date"
            {...register('deliveryDate', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/reception/pending')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Complete Sale
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;