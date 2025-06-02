import React, { useState } from 'react';
import { XIcon } from 'lucide-react';

export type DonationFormData = {
  id?: number;
  title: string;
  description: string;
  quantity: number;
  quantityUnit: 'KG' | 'PIECES' | 'LITERS' | 'PACKETS' | 'CANS';
  foodType: 'FRUITS_VEGETABLES' | 'DAIRY' | 'BAKED_GOODS' | 'MEAT_FISH' | 'CANNED_FOOD' | 'OTHER';
  location: string;
  pickupAddress: string;
  expiryDate: string;
}

interface DonationFormProps {
  initialData?: Partial<DonationFormData>;
  onSubmit: (data: DonationFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DonationForm: React.FC<DonationFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<DonationFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    quantity: initialData?.quantity || 1,
    quantityUnit: initialData?.quantityUnit || 'KG',
    foodType: initialData?.foodType || 'OTHER',
    location: initialData?.location || '',
    pickupAddress: initialData?.pickupAddress || '',
    expiryDate: initialData?.expiryDate ? 
      new Date(initialData.expiryDate).toISOString().split('T')[0] : ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required field validations
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    // Expiry date validation
    if (formData.expiryDate) {
      const selectedDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expiryDate = 'Expiry date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('Form data before submit:', formData);

    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {initialData?.id ? 'Edit Donation' : 'Create New Donation'}
        </h2>
        <button 
          onClick={onCancel} 
          className="text-gray-400 hover:text-gray-500"
          disabled={isLoading}
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              value={formData.title} 
              onChange={handleChange} 
              className={`mt-1 block w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`} 
              placeholder="Enter donation title" 
              disabled={isLoading}
            />
            {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea 
              name="description" 
              id="description" 
              rows={3} 
              value={formData.description} 
              onChange={handleChange} 
              className={`mt-1 block w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`} 
              placeholder="Describe the food items, condition, etc." 
              disabled={isLoading}
            />
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Quantity and Food Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input 
                type="number" 
                name="quantity" 
                id="quantity" 
                min="1"
                step="1"
                value={formData.quantity} 
                onChange={handleChange} 
                className={`mt-1 block w-full border ${errors.quantity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`} 
                placeholder="Enter quantity"
                disabled={isLoading}
              />
              {errors.quantity && <p className="mt-2 text-sm text-red-600">{errors.quantity}</p>}
            </div>

            <div>
              <label htmlFor="quantityUnit" className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <select
                name="quantityUnit"
                id="quantityUnit"
                value={formData.quantityUnit}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                disabled={isLoading}
              >
                <option value="KG">Kilograms</option>
                <option value="PIECES">Pieces</option>
                <option value="LITERS">Liters</option>
                <option value="PACKETS">Packets</option>
                <option value="CANS">Cans</option>
              </select>
            </div>

            <div>
              <label htmlFor="foodType" className="block text-sm font-medium text-gray-700">
                Food Type *
              </label>
              <select
                name="foodType"
                id="foodType"
                value={formData.foodType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                disabled={isLoading}
              >
                <option value="FRUITS_VEGETABLES">Fruits & Vegetables</option>
                <option value="DAIRY">Dairy</option>
                <option value="BAKED_GOODS">Baked Goods</option>
                <option value="MEAT_FISH">Meat & Fish</option>
                <option value="CANNED_FOOD">Canned Food</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input 
              type="date" 
              name="expiryDate" 
              id="expiryDate" 
              value={formData.expiryDate} 
              onChange={handleChange} 
              min={new Date().toISOString().split('T')[0]}
              className={`mt-1 block w-full border ${errors.expiryDate ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
              disabled={isLoading}
            />
            {errors.expiryDate && <p className="mt-2 text-sm text-red-600">{errors.expiryDate}</p>}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location *
            </label>
            <input 
              type="text" 
              name="location" 
              id="location" 
              value={formData.location} 
              onChange={handleChange} 
              className={`mt-1 block w-full border ${errors.location ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`} 
              placeholder="e.g., Calgary, Alberta" 
              disabled={isLoading}
            />
            {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onCancel} 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (initialData?.id ? 'Update Donation' : 'Create Donation')}
          </button>
        </div>
      </form>
    </div>
  );


};

export default DonationForm;