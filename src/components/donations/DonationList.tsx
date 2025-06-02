import React from 'react';
import DonationCard from './DonationCard';
import { Donation } from '../../utils/types';

interface DonationListProps {
  donations: Donation[];
  isNgo?: boolean;
  onClaim?: (id: number) => void;
  onComplete?: (id: number) => void;
  onEdit?: (donation: Donation) => void;
  onDelete?: (id: number) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  currentUserId?: number;
  showActions?: boolean;
}

const DonationList: React.FC<DonationListProps> = ({
                                                     donations,
                                                     isNgo = false,
                                                     onClaim,
                                                     onComplete,
                                                     onEdit,
                                                     onDelete,
                                                     emptyMessage = 'No donations available',
                                                     isLoading = false,
                                                     showActions = true,
                                                     currentUserId
                                                   }) => {
  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );
  }

  if (donations.length === 0) {
    return (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
    );
  }

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {donations.map((donation) => (
            <div key={donation.id} className="h-full">
              <DonationCard
                  donation={donation}
                  isNgo={isNgo}
                  onClaim={onClaim}
                  onComplete={onComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showActions={showActions}
                  currentUserId={currentUserId}
              />
            </div>
        ))}
      </div>
  );
};

export default DonationList;