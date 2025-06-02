import { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DonationForm, { DonationFormData } from '../../components/donations/DonationForm';
import { Donation, DonationStatus, FoodType } from '../../utils/types';
import { toast } from 'sonner';
import { donationsApi } from '../../services/api';
import DonationCard from "../../components/donations/DonationCard.tsx";

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState<'all' | DonationStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [editingDonation, setEditingDonation] = useState<DonationFormData | null>(null);
  const FOOD_TYPES: FoodType[] = ['FRUITS_VEGETABLES', 'DAIRY', 'BAKED_GOODS', 'MEAT_FISH', 'CANNED_FOOD', 'OTHER'];
  const [filters, setFilters] = useState({
    foodType: '',
    location: ''
  });

  const [pagination, setPagination] = useState({
    page: 0, // 0-based page index
    size: 9, // items per page (3x3 grid)
    totalElements: 0,
    totalPages: 0,
    sortBy: 'createdAt',
    direction: 'DESC' as const,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [donationStats, setDonationStats] = useState({
    AVAILABLE: 0,
    CLAIMED: 0,
    COMPLETED: 0,
    total: 0
  });

  // Tab configuration
  const tabs = [
    { id: 'all', name: 'All Donations' },
    { id: 'AVAILABLE', name: 'Available' },
    { id: 'CLAIMED', name: 'Claimed' },
    { id: 'COMPLETED', name: 'Completed' }
  ];

  const fetchDonations = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const { page, size, sortBy, direction } = pagination;
      const response = await donationsApi.getFilteredDonations({
        page,
        size,
        sortBy,
        direction,
        status: activeTab !== 'all' ? activeTab : undefined,
        foodType: filters.foodType || undefined,
        location: filters.location || undefined,
      });

      const donationsList = Array.isArray(response) ? response : (response.content || []);
      const totalElements = response.totalElements || donationsList.length;
      const totalPages = response.totalPages || Math.ceil(totalElements / (size || 9));

      const formattedDonations = donationsList.map((d: any) => ({
        ...d,
        id: d.id?.toString(),
        quantity: Number(d.quantity),
        quantityUnit: d.quantityUnit || 'KG',
      }));

      setDonations(formattedDonations);
      setPagination(prev => ({
        ...prev,
        totalElements,
        totalPages,
      }));

    } catch (error: any) {
      console.error('Error fetching donations:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch donations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

// Handle pagination and filter changes
  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, pagination.sortBy, pagination.direction, filters]);

  // Fetch all donations once when component mounts
  useEffect(() => {
    const fetchAllDonations = async () => {
      try {
        const response = await donationsApi.getFilteredDonations({
          page: 0,
          size: 1000, // Adjust based on your needs
          sortBy: 'createdAt',
          direction: 'DESC',
        });

        const allDonationsList = Array.isArray(response) ? response : (response.content || []);
        setAllDonations(allDonationsList);

        // Calculate initial stats
        const initialStats = {
          AVAILABLE: 0,
          CLAIMED: 0,
          COMPLETED: 0,
          total: 0
        };

        const stats = allDonationsList.reduce(
            (acc: typeof initialStats, donation: Donation) => {
              acc[donation.status] = (acc[donation.status] || 0) + 1;
              acc.total = allDonationsList.length;
              return acc;
            },
            { ...initialStats }
        );

        setDonationStats({
          AVAILABLE: stats.AVAILABLE || 0,
          CLAIMED: stats.CLAIMED || 0,
          COMPLETED: stats.COMPLETED || 0,
          total: allDonationsList.length
        });

      } catch (error) {
        console.error('Error fetching all donations:', error);
      }
    };

    fetchAllDonations();
  }, []);

  const handleCreateDonation = async (formData: DonationFormData) => {
    try {
      const donationData = {
        ...formData,
        quantity: formData.quantity,
        status: 'AVAILABLE' as const,
        quantityUnit: formData.quantityUnit,
      };
      const newDonation = await donationsApi.createDonation(donationData);

      // Update all donations
      setAllDonations(prev => {
        const updatedDonations = [
          { ...newDonation, id: newDonation.id, quantity: Number(newDonation.quantity) },
          ...prev
        ];

        // Update stats based on the new state
        const stats = updatedDonations.reduce((acc, donation) => {
          acc[donation.status] = (acc[donation.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setDonationStats({
          AVAILABLE: stats.AVAILABLE || 0,
          CLAIMED: stats.CLAIMED || 0,
          COMPLETED: stats.COMPLETED || 0,
          total: updatedDonations.length
        });

        return updatedDonations;
      });

      // Refresh the current view
      fetchDonations();
      setShowForm(false);
      toast.success('Donation created successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create donation';
      toast.error(errorMessage);
    }
  };

// Similar updates for handleUpdateDonation and handleDeleteDonation

  const handleUpdateDonation = async (formData: DonationFormData) => {
    if (!editingDonation?.id) return;
    try {
      const updateData = {
        ...formData,
        quantity: formData.quantity,
        quantityUnit: formData.quantityUnit,
      };
      const updatedDonation = await donationsApi.updateDonation(editingDonation.id, updateData);

      // Update all donations
      setAllDonations(prev => {
        const updatedDonations = prev.map(d =>
            d.id === editingDonation.id
                ? { ...d, ...updatedDonation, id: updatedDonation.id, quantity: Number(updatedDonation.quantity) }
                : d
        );

        // Update stats
        const stats = updatedDonations.reduce((acc, donation) => {
          acc[donation.status] = (acc[donation.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setDonationStats({
          AVAILABLE: stats.AVAILABLE || 0,
          CLAIMED: stats.CLAIMED || 0,
          COMPLETED: stats.COMPLETED || 0,
          total: updatedDonations.length
        });

        return updatedDonations;
      });

      // Update current view
      setDonations(prev =>
          prev.map(d =>
              d.id === editingDonation.id
                  ? { ...d, ...updatedDonation, id: updatedDonation.id, quantity: Number(updatedDonation.quantity) }
                  : d
          )
      );

      setEditingDonation(null);
      setShowForm(false);
      toast.success('Donation updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update donation';
      toast.error(errorMessage);
    }
  };

  const handleDeleteDonation = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await donationsApi.deleteDonation(id);

        // Update all donations
        setAllDonations(prev => {
          const updatedDonations = prev.filter(d => d.id !== id);

          // Update stats
          const stats = updatedDonations.reduce((acc, donation) => {
            acc[donation.status] = (acc[donation.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          setDonationStats({
            AVAILABLE: stats.AVAILABLE || 0,
            CLAIMED: stats.CLAIMED || 0,
            COMPLETED: stats.COMPLETED || 0,
            total: updatedDonations.length
          });

          return updatedDonations;
        });

        // Update current view
        setDonations(prev => prev.filter(d => d.id !== id));
        toast.success('Donation deleted successfully!');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to delete donation';
        toast.error(errorMessage);
      }
    }
  };

  const handleEditDonation = (donation: Donation) => {
    const formData: DonationFormData = {
      ...donation,
      id: donation.id,
      quantity: Number(donation.quantity),
      quantityUnit: donation.quantityUnit,
      expiryDate: donation.expiryDate || '',
      pickupAddress: donation.location || ''
    };
    setEditingDonation(formData);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDonation(null);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const resetFilters = () => {
    setFilters({ foodType: '', location: '' });
    // Reset to first page when filters are cleared
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleTabChange = (tabId: string) => {
    // Only update if tab actually changed
    if (tabId !== activeTab) {
      setActiveTab(tabId as any);
      // Reset pagination without triggering a fetch
      setPagination(prev => ({ ...prev, page: 0 }));
    }
  };
  // Handle tab changes separately
// Handle tab changes and fetch data
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { page, size, sortBy, direction } = pagination;
        const response = await donationsApi.getFilteredDonations({
          page,
          size,
          sortBy,
          direction,
          status: activeTab !== 'all' ? activeTab : undefined,
          foodType: filters.foodType || undefined,
          location: filters.location || undefined,
        });

        const donationsList = Array.isArray(response) ? response : (response.content || []);
        const totalElements = response.totalElements || donationsList.length;
        const totalPages = response.totalPages || Math.ceil(totalElements / (pagination.size || 9));

        const formattedDonations = donationsList.map((d: any) => ({
          ...d,
          id: d.id?.toString(),
          quantity: Number(d.quantity),
          quantityUnit: d.quantityUnit || 'KG',
        }));

        setDonations(formattedDonations);
        setPagination(prev => ({
          ...prev,
          totalElements,
          totalPages,
        }));
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching donations:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch donations';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [activeTab, pagination.page, pagination.size, pagination.sortBy, pagination.direction, filters]);

  const hasActiveFilters = filters.foodType || filters.location;

  return (
      <DashboardLayout activeTab="dashboard">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
          {/* Header - Always visible */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Donor Dashboard
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                  type="button"
                  onClick={() => { setShowForm(true); setEditingDonation(null); }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                {editingDonation ? 'Edit Donation' : 'New Donation'}
              </button>
            </div>
          </div>

          {/* Stats - Always visible */}
          <div className="mt-8">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {tabs.map(tab => (
                  <div key={tab.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {tab.name}
                      </dt>
                      <dd
                          className={`mt-1 text-3xl font-semibold ${
                              tab.id === 'AVAILABLE' ? 'text-green-600' :
                                  tab.id === 'CLAIMED' ? 'text-blue-600' :
                                      tab.id === 'COMPLETED' ? 'text-purple-600' : 'text-gray-900'
                          }`}
                      >
                        {isLoading ? (
                            <span className="inline-block h-8 w-8 animate-pulse rounded bg-gray-200"></span>
                        ) : (
                            tab.id === 'all' ? donationStats.total : donationStats[tab.id as keyof typeof donationStats] || 0
                        )}
                      </dd>
                    </div>
                  </div>
              ))}
            </dl>
          </div>

          {/* Conditional Rendering: Show either Form OR (Filters + Donation List) */}
          {showForm || editingDonation ? (
              /* Show Form when editing or creating */
              <div className="mt-8">
                <DonationForm
                    initialData={editingDonation || undefined}
                    onSubmit={editingDonation ? handleUpdateDonation : handleCreateDonation}
                    onCancel={handleCancelForm}
                />
              </div>
          ) : (
              /* Show Filters and Donation List when not editing/creating */
              <>
                {/* Filters and Tabs */}
                <div className="mt-8 bg-white shadow rounded-lg p-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto pb-2">
                      {tabs.map(tab => (
                          <button
                              key={tab.id}
                              onClick={() => handleTabChange(tab.id)}
                              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                              ${
                                  activeTab === tab.id
                                      ? 'border-emerald-500 text-emerald-600'
                                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                          >
                            {tab.name}
                          </button>
                      ))}
                    </nav>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="w-full sm:w-auto">
                      <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 mb-1">
                        Food Type
                      </label>
                      <select
                          id="foodType"
                          name="foodType"
                          value={filters.foodType}
                          onChange={handleFilterChange}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                      >
                        <option value="">All Food Types</option>
                        {FOOD_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type.split('_').map(word =>
                                  word.charAt(0) + word.slice(1).toLowerCase()
                              ).join(' ')}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-64">
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                          type="text"
                          name="location"
                          id="location"
                          value={filters.location}
                          onChange={handleFilterChange}
                          placeholder="Filter by location"
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                      />
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-end">
                          <button
                              onClick={resetFilters}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Clear Filters
                          </button>
                        </div>
                    )}
                  </div>
                </div>

                {/* Donation List with increased spacing */}
                <div className="mt-8" id="my-donations">
                  {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                      </div>
                  ) : error ? (
                      <div className="text-red-500 text-center p-4">{error}</div>
                  ) : (
                      <div className="space-y-6">
                        <div className="bg-white shadow overflow-hidden rounded-lg p-6">
                          <div className="mb-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              {activeTab === 'all' ? 'All Donations' :
                                  `${tabs.find(t => t.id === activeTab)?.name} Donations`}
                              {hasActiveFilters && ' (Filtered)'}
                            </h3>
                          </div>

                          {donations.length === 0 ? (
                              <div className="py-8 text-center text-gray-500">
                                {hasActiveFilters ? (
                                    <>
                                      <p>No donations match your current filters.</p>
                                      <button
                                          onClick={resetFilters}
                                          className="mt-2 text-emerald-600 hover:text-emerald-800 font-medium"
                                      >
                                        Clear all filters
                                      </button>
                                    </>
                                ) : (
                                    <p>No donations found. Create your first donation to get started!</p>
                                )}
                              </div>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {donations.map(donation => (
                                    <DonationCard
                                        key={donation.id}
                                        donation={donation}
                                        onEdit={handleEditDonation}
                                        onDelete={handleDeleteDonation}
                                        showActions={activeTab !== 'COMPLETED'}
                                    />
                                ))}
                              </div>
                          )}
                        </div>
                      </div>
                  )}
                  {/* Add Pagination Controls */}
                  {donations.length > 0 && (
                      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(pagination.page * pagination.size) + 1}</span> to{' '}
                          <span className="font-medium">{Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}</span>{' '}
                          of <span className="font-medium">{pagination.totalElements}</span> results
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                              value={pagination.size}
                              onChange={(e) => setPagination(prev => ({ ...prev, size: Number(e.target.value), page: 0 }))}
                              className="text-sm border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value={9}>9 per page</option>
                            <option value={18}>18 per page</option>
                            <option value={27}>27 per page</option>
                          </select>

                          <div className="flex gap-1">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: 0 }))}
                                disabled={pagination.page === 0}
                                className="px-2 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
                            >
                              &laquo;
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                                disabled={pagination.page === 0}
                                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
                            >
                              &lsaquo;
                            </button>
                            <span className="px-3 py-1 text-sm">Page {pagination.page + 1} of {Math.max(1, pagination.totalPages)}</span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, prev.totalPages - 1) }))}
                                disabled={pagination.page >= pagination.totalPages - 1}
                                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
                            >
                              &rsaquo;
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages - 1 }))}
                                disabled={pagination.page >= pagination.totalPages - 1}
                                className="px-2 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
                            >
                              &raquo;
                            </button>
                          </div>
                        </div>
                      </div>
                  )}
                </div>
              </>
          )}
        </div>
      </DashboardLayout>
  );
};

export default DonorDashboard;