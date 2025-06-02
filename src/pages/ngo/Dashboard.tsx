import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DonationList from '../../components/donations/DonationList';
import { Donation } from '../../utils/types';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { donationsApi } from '../../services/api';

type PaginationState = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sortBy: string;
  direction: 'ASC' | 'DESC';
};

const PaginationControls = ({
                              pagination,
                              onPageChange,
                              onPageSizeChange
                            }: {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => {
  if (pagination.totalElements === 0) return null;

  return (
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{(pagination.page * pagination.size) + 1}</span> to{' '}
          <span className="font-medium">
          {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
        </span>{' '}
          of <span className="font-medium">{pagination.totalElements}</span> results
        </div>

        <div className="flex items-center gap-2">
          <select
              value={pagination.size}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-sm border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value={9}>9 per page</option>
            <option value={18}>18 per page</option>
            <option value={27}>27 per page</option>
          </select>

          <div className="flex gap-1">
            <button
                onClick={() => onPageChange(0)}
                disabled={pagination.page === 0}
                className="px-2 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
            >
              &laquo;
            </button>
            <button
                onClick={() => onPageChange(Math.max(0, pagination.page - 1))}
                disabled={pagination.page === 0}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
            >
              &lsaquo;
            </button>
            <span className="px-3 py-1 text-sm">
            Page {pagination.page + 1} of {Math.max(1, pagination.totalPages)}
          </span>
            <button
                onClick={() => onPageChange(Math.min(pagination.page + 1, pagination.totalPages - 1))}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
            >
              &rsaquo;
            </button>
            <button
                onClick={() => onPageChange(pagination.totalPages - 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="px-2 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>
  );
};


const NgoDashboard = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'claimed' | 'completed'>('available');
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [claimedDonations, setClaimedDonations] = useState<Donation[]>([]);
  const [completedDonations, setCompletedDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const isNgo = user?.role?.trim().toUpperCase() === 'ROLE_NGO';

  const [pagination, setPagination] = useState<Record<string, PaginationState>>({
    available: {
      page: 0,
      size: 9,
      totalElements: 0,
      totalPages: 0,
      sortBy: 'createdAt',
      direction: 'DESC',
    },
    claimed: {
      page: 0,
      size: 9,
      totalElements: 0,
      totalPages: 0,
      sortBy: 'createdAt',
      direction: 'DESC',
    },
    completed: {
      page: 0,
      size: 9,
      totalElements: 0,
      totalPages: 0,
      sortBy: 'createdAt',
      direction: 'DESC',
    },
  });

  const fetchDonations = async (
      status: 'AVAILABLE' | 'CLAIMED' | 'COMPLETED',
      page = 0,
      size = 9,
      countOnly = false
  ) => {
    try {
      setIsLoading(true);
      const response = await donationsApi.getFilteredDonations({
        status,
        page: countOnly ? 0 : page,
        size: countOnly ? 1 : size, // Only fetch 1 item if we only need the count
        sortBy: pagination[status.toLowerCase()].sortBy,
        direction: pagination[status.toLowerCase()].direction
      });

      return {
        donations: countOnly ? [] : (response.content || []),
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch donations';
      toast.error(errorMessage);
      return { donations: [], totalElements: 0, totalPages: 0 };
    } finally {
      if (!countOnly) {
        setIsLoading(false);
      }
    }
  };

  const loadAllCounts = async () => {
    try {
      setIsLoading(true);
      const [available, claimed, completed] = await Promise.all([
        fetchDonations('AVAILABLE', 0, 1, true),
        fetchDonations('CLAIMED', 0, 1, true),
        fetchDonations('COMPLETED', 0, 1, true)
      ]);

      setPagination(prev => ({
        ...prev,
        available: {
          ...prev.available,
          totalElements: available.totalElements
        },
        claimed: {
          ...prev.claimed,
          totalElements: claimed.totalElements
        },
        completed: {
          ...prev.completed,
          totalElements: completed.totalElements
        }
      }));

      setDonationCounts({
        available: available.totalElements,
        claimed: claimed.totalElements,
        completed: completed.totalElements,
        total: available.totalElements + claimed.totalElements + completed.totalElements
      });
    } catch (error) {
      console.error('Error loading counts:', error);
      toast.error('Failed to load donation counts');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await loadAllCounts(); // Load counts first
      await loadDonations(activeTab); // Then load the active tab's data
    };

    loadInitialData();
  }, []);

  const loadDonations = async (tab: 'available' | 'claimed' | 'completed' = activeTab) => {
    try {
      setIsLoading(true);
      const status = tab.toUpperCase() as 'AVAILABLE' | 'CLAIMED' | 'COMPLETED';
      const page = pagination[tab].page;
      const size = pagination[tab].size;

      const { donations, totalElements, totalPages } = await fetchDonations(status, page, size);

      const setDonations = {
        available: setAvailableDonations,
        claimed: setClaimedDonations,
        completed: setCompletedDonations,
      }[tab];

      setDonations(donations);

      // Update pagination without affecting counts
      setPagination(prev => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          totalElements,
          totalPages
        }
      }));

    } catch (error) {
      console.error('Error loading donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonations(activeTab);
  }, [activeTab, pagination[activeTab].page, pagination[activeTab].size]);

  const handlePageChange = (tab: 'available' | 'claimed' | 'completed', page: number) => {
    setPagination(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        page
      }
    }));
  };

  const handlePageSizeChange = (tab: 'available' | 'claimed' | 'completed', size: number) => {
    setPagination(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        size,
        page: 0
      }
    }));
  };

  const handleClaimDonation = async (id: number) => {
    if (!user?.id) {
      toast.error('You must be logged in to claim a donation');
      return;
    }

    try {
      // Optimistically update the UI
      const donationToClaim = availableDonations.find(d => d.id === id);
      if (donationToClaim) {
        const optimisticDonation = {
          ...donationToClaim,
          status: 'CLAIMED' as const,
          claimedById: user.id,
          claimedByName: user.name || 'Your Organization'
        };

        // Update states
        setAvailableDonations(prev => prev.filter(d => d.id !== id));
        setClaimedDonations(prev => [optimisticDonation, ...prev]);

        // Update counts immediately
        setDonationCounts(prev => ({
          ...prev,
          available: prev.available - 1,
          claimed: prev.claimed + 1,
          total: prev.total  // total remains the same
        }));
      }

      // Make the API call
      const updatedDonation = await donationsApi.claimDonation(id, user.id);

      setPagination(prev => {
        const newPagination = {
          ...prev,
          available: {
            ...prev.available,
            totalElements: prev.available.totalElements - 1
          },
          claimed: {
            ...prev.claimed,
            totalElements: prev.claimed.totalElements + 1
          }
        };
        return newPagination;
      });

      // Update with server response
      setClaimedDonations(prev => [
        {...updatedDonation, claimedByName: user.name || 'Your Organization'},
        ...prev.filter(d => d.id !== id)
      ]);

      toast.success('Donation claimed successfully!');
    } catch (error: any) {
      // Revert on error
      await loadDonations('available');
      await loadDonations('claimed');
      const errorMessage = error.response?.data?.message || 'Failed to claim donation';
      toast.error(errorMessage);
    }

    await loadAllCounts(); // Refresh all counts
  };

  const handleCompleteDonation = async (id: number) => {
    if (!user?.id) {
      toast.error('You must be logged in to complete a donation');
      return;
    }

    try {
      // Optimistically update the UI
      const donationToComplete = claimedDonations.find(d => d.id === id);
      if (donationToComplete) {
        const optimisticDonation = {
          ...donationToComplete,
          status: 'COMPLETED' as const
        };

        // Update states
        setClaimedDonations(prev => prev.filter(d => d.id !== id));
        setCompletedDonations(prev => [optimisticDonation, ...prev]);

        // Update counts immediately
        setDonationCounts(prev => ({
          ...prev,
          claimed: prev.claimed - 1,
          completed: prev.completed + 1,
          total: prev.total  // total remains the same
        }));
      }

      // Make the API call
      const updatedDonation = await donationsApi.completeDonation(id, user.id);

      setPagination(prev => {
        const newPagination = {
          ...prev,
          claimed: {
            ...prev.claimed,
            totalElements: prev.claimed.totalElements - 1
          },
          completed: {
            ...prev.completed,
            totalElements: prev.completed.totalElements + 1
          }
        };
        return newPagination;
      });

      // Update with server response
      setCompletedDonations(prev => [
        updatedDonation,
        ...prev.filter(d => d.id !== updatedDonation.id)
      ]);

      toast.success('Donation marked as completed!');
    } catch (error: any) {
      // Revert on error
      await loadDonations('claimed');
      await loadDonations('completed');
      const errorMessage = error.response?.data?.message || 'Failed to complete donation';
      toast.error(errorMessage);
    }
    await loadAllCounts(); // Refresh all counts
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        loadDonations('available'),
        loadDonations('claimed'),
        loadDonations('completed')
      ]);
    };

    loadInitialData();
  }, []);

  const [donationCounts, setDonationCounts] = useState({
    available: pagination.available.totalElements,
    claimed: pagination.claimed.totalElements,
    completed: pagination.completed.totalElements,
    total: pagination.available.totalElements +
        pagination.claimed.totalElements +
        pagination.completed.totalElements
  });

  useEffect(() => {
    setDonationCounts({
      available: pagination.available.totalElements,
      claimed: pagination.claimed.totalElements,
      completed: pagination.completed.totalElements,
      total: pagination.available.totalElements +
          pagination.claimed.totalElements +
          pagination.completed.totalElements
    });
  }, [pagination.available.totalElements, pagination.claimed.totalElements, pagination.completed.totalElements]);

  return (
      <DashboardLayout activeTab={activeTab}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                NGO Dashboard
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 truncate">Available Donations</dt>
                </div>
                <dd className="mt-1 text-3xl font-semibold text-emerald-600">
                  {donationCounts.available}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 truncate">Claimed by You</dt>
                </div>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                  {donationCounts.claimed}
                </dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                </div>
                <dd className="mt-1 text-3xl font-semibold text-purple-600">
                  {donationCounts.completed}
                </dd>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              <select
                  id="tabs"
                  name="tabs"
                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as 'available' | 'claimed' | 'completed')}
              >
                <option value="available">Available ({donationCounts.available})</option>
                <option value="claimed">Claimed ({donationCounts.claimed})</option>
                <option value="completed">Completed ({donationCounts.completed})</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto pb-2">
                  <button
                      onClick={() => setActiveTab('available')}
                      className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                          activeTab === 'available'
                              ? 'border-emerald-500 text-emerald-600'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    Available
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {donationCounts.available}
                  </span>
                  </button>
                  <button
                      onClick={() => setActiveTab('claimed')}
                      className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                          activeTab === 'claimed'
                              ? 'border-emerald-500 text-emerald-600'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    Claimed
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {donationCounts.claimed}
                  </span>
                  </button>
                  <button
                      onClick={() => setActiveTab('completed')}
                      className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                          activeTab === 'completed'
                              ? 'border-emerald-500 text-emerald-600'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    Completed
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {donationCounts.completed}
                  </span>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {activeTab === 'available' && (
                <div id="available-donations">
                  <DonationList
                      donations={availableDonations}
                      onClaim={handleClaimDonation}
                      emptyMessage="There are no available donations at the moment."
                      isLoading={isLoading}
                      isNgo={isNgo}
                      currentUserId={user?.id}
                  />
                  <PaginationControls
                      pagination={pagination.available}
                      onPageChange={(page) => handlePageChange('available', page)}
                      onPageSizeChange={(size) => handlePageSizeChange('available', size)}
                  />
                </div>
            )}

            {activeTab === 'claimed' && (
                <div id="claimed-donations">
                  <DonationList
                      donations={claimedDonations}
                      onComplete={handleCompleteDonation}
                      emptyMessage="You haven't claimed any donations yet."
                      isLoading={isLoading}
                      isNgo={isNgo}
                      currentUserId={user?.id}
                  />
                  <PaginationControls
                      pagination={pagination.claimed}
                      onPageChange={(page) => handlePageChange('claimed', page)}
                      onPageSizeChange={(size) => handlePageSizeChange('claimed', size)}
                  />
                </div>
            )}

            {activeTab === 'completed' && (
                <div id="completed-donations">
                  <DonationList
                      donations={completedDonations}
                      emptyMessage="You haven't completed any donations yet."
                      isLoading={isLoading}
                      isNgo={isNgo}
                      currentUserId={user?.id}
                  />
                  <PaginationControls
                      pagination={pagination.completed}
                      onPageChange={(page) => handlePageChange('completed', page)}
                      onPageSizeChange={(size) => handlePageSizeChange('completed', size)}
                  />
                </div>
            )}
          </div>
        </div>
      </DashboardLayout>
  );
};

export default NgoDashboard;