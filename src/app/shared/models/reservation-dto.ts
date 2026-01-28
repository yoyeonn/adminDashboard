export type ReservationDTO = {
  id: number;

  userId?: number;
  userName?: string;
  userEmail?: string;

  hotelId?: number;
  hotelName?: string;
  hotelLocation?: string;

  packId?: number;
  packName?: string;
  packLocation?: string;


  destinationId?: number;
  destinationName?: string;
  destinationCountry?: string;
  destinationLocation?: string;

  checkIn?: string;
  checkOut?: string;

  adults?: number;
  children?: number;
  babies?: number;

  mealPlan?: 'ROOM_ONLY' | 'BB' | 'HB' | 'FB' | 'AI' | 'UAI';
  totalAmount?: number;

  createdAt?: string;
  roomNames?: string[];

  type?: 'HOTEL' | 'DESTINATION' | 'PACK';
};
