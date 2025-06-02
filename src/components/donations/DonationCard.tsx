import React from 'react';
import { CalendarIcon, MapPinIcon, PackageIcon, ClockIcon } from 'lucide-react';
import { Donation, DonationStatus } from '../../utils/types';

interface DonationCardProps {
  donation: Donation;
  isNgo?: boolean;
  onClaim?: (id: number) => void;
  onComplete?: (id: number) => void;
  onEdit?: (donation: Donation) => void;
  onDelete?: (id: number) => void;
  currentUserId?: number;
  showActions?: boolean;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getStatusColor = (status: DonationStatus): string => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-green-100 text-green-800';
    case 'CLAIMED':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const DonationCard: React.FC<DonationCardProps> = ({
                                                     donation,
                                                     isNgo = false,
                                                     onClaim,
                                                     onComplete,
                                                     onEdit,
                                                     onDelete,
                                                     showActions = true,
                                                   }) => {
  const shouldShowDonorActions = showActions && !isNgo;
  const shouldShowNgoActions = showActions && isNgo;

  return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">
              {donation.title}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
            {donation.status}
          </span>
          </div>
          <p className="mt-2 text-gray-600">{donation.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <PackageIcon className="mr-1.5 h-4 w-4 text-gray-400" />
              {donation.quantity} {donation.quantityUnit ? donation.quantityUnit.toString().charAt(0).toUpperCase() + donation.quantityUnit.toString().slice(1).toLowerCase() : 'items'}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="mr-1.5 h-4 w-4 text-gray-400" />
              Expires: {formatDate(donation.expirationDate)}
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon className="mr-1.5 h-4 w-4 text-gray-400" />
            {donation.location}
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <ClockIcon className="mr-1.5 h-4 w-4 text-gray-400" />
            Posted on {formatDate(donation.createdAt)}
            {donation.status === 'CLAIMED' && donation.claimedByName && (
                <span className="ml-2">• Claimed by {donation.claimedByName}</span>
            )}
          </div>

          {(shouldShowDonorActions || shouldShowNgoActions) && (
              <div className="mt-5 flex justify-between">
                {!isNgo ? (
                    // Donor actions
                    <div className="flex space-x-3">
                      {donation.status === 'AVAILABLE' && (
                          <>
                            <button
                                onClick={() => onEdit?.(donation)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                                onClick={() => onDelete?.(donation.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </>
                      )}
                    </div>
                ) : (
                    // NGO actions
                    <div className="flex space-x-3">
                        {donation.status === 'AVAILABLE' && (
                            <button
                                onClick={() => onClaim?.(donation.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-emerald-600 hover:bg-emerald-700"
                            >
                                Claim Donation
                            </button>
                        )}
                        {donation.status === 'CLAIMED' && (
                            <button
                                onClick={() => onComplete?.(donation.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Mark as Completed
                            </button>
                        )}
                    </div>
                )}
                <div>
                  <span className="text-xs text-gray-500">{donation.donorName}</span>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default DonationCard;