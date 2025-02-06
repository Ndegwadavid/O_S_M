// src/components/examination/PrescriptionForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const PrescriptionForm = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/clients/${clientId}`);
        setClient(response.data);
      } catch (error) {
        setError('Failed to fetch client details');
        console.error('Error fetching client:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');

    try {
      await axios.put(`http://localhost:5000/api/examination/${clientId}`, {
        prescription: {
          rightEye: {
            sph: data.rightEyeSph,
            cyl: data.rightEyeCyl,
            axis: data.rightEyeAxis,
            va: data.rightEyeVa,
            add: data.rightEyeAdd,
            ipd: data.rightEyeIpd
          },
          leftEye: {
            sph: data.leftEyeSph,
            cyl: data.leftEyeCyl,
            axis: data.leftEyeAxis,
            va: data.leftEyeVa,
            add: data.leftEyeAdd,
            ipd: data.leftEyeIpd
          },
          clinicalHistory: data.clinicalHistory
        }
      });
      
      // Show success message and redirect
      alert('Prescription saved successfully');
      navigate('/examination/waiting');
    } catch (error) {
      setError('Failed to save prescription. Please try again.');
      console.error('Error saving prescription:', error);
    } finally {
      setSubmitting(false);
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
        <h2 className="text-2xl font-bold text-gray-900">Eye Examination</h2>
        <p className="text-gray-600">
          Patient: {client?.first_name} {client?.last_name} ({client?.reg_number})
        </p>
        {client?.previous_rx && (
          <div className="mt-2 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm font-medium text-yellow-800">Previous RX:</p>
            <p className="text-sm text-yellow-700">{client.previous_rx}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Right Eye */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 pb-2 border-b">Right Eye (R)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SPH</label>
                <input
                  type="text"
                  {...register('rightEyeSph', { required: 'Required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.rightEyeSph && (
                  <p className="mt-1 text-xs text-red-600">{errors.rightEyeSph.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">CYL</label>
                <input
                  type="text"
                  {...register('rightEyeCyl', { required: 'Required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.rightEyeCyl && (
                  <p className="mt-1 text-xs text-red-600">{errors.rightEyeCyl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">AXIS</label>
                <input
                  type="text"
                  {...register('rightEyeAxis', { required: 'Required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.rightEyeAxis && (
                  <p className="mt-1 text-xs text-red-600">{errors.rightEyeAxis.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">VA</label>
                <input
                  type="text"
                  {...register('rightEyeVa', { required: 'Required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.rightEyeVa && (
                  <p className="mt-1 text-xs text-red-600">{errors.rightEyeVa.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ADD</label>
                <input
                  type="text"
                  {...register('rightEyeAdd')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IPD</label>
                <input
                  type="text"
                  {...register('rightEyeIpd')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Left Eye */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 pb-2 border-b">Left Eye (L)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SPH</label>
                <input
                  type="text"
                  {...register('leftEyeSph', { required: 'Required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.leftEyeSph && (
                  <p className="mt-1 text-xs text-red-600">{errors.leftEyeSph.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">CYL</label>
                <input
                  type="text"
                  {...register('leftEyeCyl', { required: 'Required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.leftEyeCyl && (
                  <p className="mt-1 text-xs text-red-600">{errors.leftEyeCyl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">AXIS</label>
                <input
                  type="text"
                  {...register('leftEyeAxis', { required: 'Required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.leftEyeAxis && (
                  <p className="mt-1 text-xs text-red-600">{errors.leftEyeAxis.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">VA</label>
                <input
                  type="text"
                  {...register('leftEyeVa', { required: 'Required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.leftEyeVa && (
                  <p className="mt-1 text-xs text-red-600">{errors.leftEyeVa.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ADD</label>
                <input
                  type="text"
                  {...register('leftEyeAdd')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IPD</label>
                <input
                  type="text"
                  {...register('leftEyeIpd')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical History */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 pb-2 border-b">Clinical History & Notes</h3>
          <textarea
            {...register('clinicalHistory')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter any relevant clinical history or additional notes..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/examination/waiting')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;