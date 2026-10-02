

export interface SeedTask {
  category: string;
  title: string;
  description: string;
}

export const ERRANDS = 'Errands & Daily Tasks';
export const HOME_SERVICES = 'Home Services';
export const TRAVEL = 'Travel & Tourism';
export const HEALTH = 'Health & Medical';

export const tasks: SeedTask[] = [
  // ---- Errands & Daily Tasks (5) ----
  { category: ERRANDS, title: 'Courier Pickup & Drop', description: 'Schedule a courier for documents, parcels or returns and track it until it lands.' },
  { category: ERRANDS, title: 'Grocery Pickup & Restocking', description: 'Weekly grocery run built from your list, delivered to your door before 10 AM.' },
  { category: ERRANDS, title: 'Medicine Pickup & Refills', description: 'Refill prescriptions from your neighbourhood pharmacy and deliver them monthly.' },
  { category: ERRANDS, title: 'Pet Food Supplies', description: 'Monthly food and vet supply restock for dogs, cats and other house pets.' },
  { category: ERRANDS, title: 'Government/Postal Paperwork', description: 'Aadhaar, PAN and postal submissions filed and tracked on your behalf.' },

  // ---- Home Services (5) ----
  { category: HOME_SERVICES, title: 'Plumbing Repairs & Installations', description: 'Leak fixes, fixture swaps and new fittings handled by verified technicians.' },
  { category: HOME_SERVICES, title: 'Handyman On-Call Services', description: 'One call for shelves, curtains, fittings and the odd jobs that pile up.' },
  { category: HOME_SERVICES, title: 'Furniture Assembly', description: 'Flat-pack furniture put together in one visit, packaging taken away after.' },
  { category: HOME_SERVICES, title: 'Painting & Carpentry Work', description: 'Wall painting, touch-ups and bespoke woodwork for the house you own.' },
  { category: HOME_SERVICES, title: 'Deep Cleaning & Sanitation', description: 'Kitchen, bathroom and sofa deep cleans with sanitisation before handover.' },

  // ---- Travel & Tourism (5) ----
  { category: TRAVEL, title: 'Flight & Rail Reservations', description: 'Domestic and international tickets compared and booked at the best fare.' },
  { category: TRAVEL, title: 'Hotel & Stay Bookings', description: 'Stays for family and guests, negotiated rates and free cancellation options.' },
  { category: TRAVEL, title: 'Visa Application Support', description: 'Form filling, document checks and appointment booking for visa applications.' },
  { category: TRAVEL, title: 'Airport Transfers', description: 'Pickup and drop with a verified driver, flight tracked for late landings.' },
  { category: TRAVEL, title: 'Custom Itinerary Planning', description: 'Day-by-day plans for holidays, built around your dates and budget.' },

  // ---- Health & Medical (5) ----
  { category: HEALTH, title: 'Doctor Appointment Booking', description: 'Specialist and general physician slots booked with reminders before the visit.' },
  { category: HEALTH, title: 'Home Lab Test Coordination', description: 'Sample collection at home, results tracked and explained by your manager.' },
  { category: HEALTH, title: 'Physiotherapy Coordination', description: 'Sessions scheduled at home or clinic, with progress notes after each visit.' },
  { category: HEALTH, title: 'Elderly Care Check-ins', description: 'Regular wellness calls, prescription refills and doctor visits for parents.' },
  { category: HEALTH, title: 'Preventive Health Care', description: 'Annual check-ups, vaccination schedules and health screening reminders.' },
];
