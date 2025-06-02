
export type RoleName = 'ROLE_DONOR' | 'ROLE_NGO';
export type FoodType = 'FRUITS_VEGETABLES' | 'DAIRY' | 'BAKED_GOODS' | 'MEAT_FISH' | 'CANNED_FOOD' | 'OTHER';
export type DonationStatus = 'AVAILABLE' | 'CLAIMED' | 'COMPLETED';
export type quantityUnit = 'KG' | 'PIECES' | 'LITERS' | 'PACKETS' | 'CANS';




export interface User {
  id: number;
  name: string;
  email: string;
  role: RoleName;
}



export interface Donation {
  donorName: string;
  claimedById?: number;
  id: number;
  title: string; // Required to match backend
  description: string;
  quantity: number;
  location: string;

  foodType: FoodType;
  status: DonationStatus;
  quantityUnit: quantityUnit;

  // Handle both field names for dates
  expirationDate?: string; // Backend field name
  expiryDate?: string; // Frontend compatibility

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  claimedAt?: string;
  completedAt?: string;

  // IDs - using number to match backend Long
  donorId?: number;
  ngoId?: number;
  volunteerId?: number;

  // Additional fields from second interface
  claimedByName?: string;
  completedByName?: string;
  user?: User; // For donor information
}