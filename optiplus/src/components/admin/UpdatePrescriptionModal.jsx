// src/components/admin/UpdatePrescriptionModal.jsx
import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const UpdatePrescriptionModal = ({ 
  isOpen, 
  onClose, 
  clientId, 
  currentPrescription, 
  onUpdate 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      rightEyeSph: currentPrescription?.right_eye_sph || '',
      rightEyeCyl: currentPrescription?.right_eye_cyl || '',
      rightEyeAxis: currentPrescription?.right_eye_axis || '',
      rightEyeVa: currentPrescription?.right_eye_va || '',
      rightEyeAdd: currentPrescription?.right_eye_add || '',
      rightEyeIpd: currentPrescription?.right_eye_ipd || '',
      leftEyeSph: currentPrescription?.left_eye_sph || '',
      leftEyeCyl: currentPrescription?.left_eye_cyl || '',
      leftEyeAxis: currentPrescription?.left_eye_axis || '',
      leftEyeVa: currentPrescription?.left_eye_va || '',
      leftEyeAdd: currentPrescription?.left_eye_add || '',
      leftEyeIpd: currentPrescription?.left_eye_ipd || '',
      clinicalHistory: currentPrescription?.clinical_history || ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/clients/${clientId}/prescription`, {
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

      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating prescription:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Update Prescription
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Right Eye */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Right Eye (R)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">SPH</label>
                          <input
                            type="text"
                            {...register('rightEyeSph', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">CYL</label>
                          <input
                            type="text"
                            {...register('rightEyeCyl', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">AXIS</label>
                          <input
                            type="text"
                            {...register('rightEyeAxis', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">VA</label>
                          <input
                            type="text"
                            {...register('rightEyeVa', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
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
                      <h4 className="font-medium text-gray-900">Left Eye (L)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">SPH</label>
                          <input
                            type="text"
                            {...register('leftEyeSph', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">CYL</label>
                          <input
                            type="text"
                            {...register('leftEyeCyl', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">AXIS</label>
                          <input
                            type="text"
                            {...register('leftEyeAxis', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">VA</label>
                          <input
                            type="text"
                            {...register('leftEyeVa', { required: true })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
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
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700">Clinical History</label>
                    <textarea
                      {...register('clinicalHistory')}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Update Prescription
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UpdatePrescriptionModal;