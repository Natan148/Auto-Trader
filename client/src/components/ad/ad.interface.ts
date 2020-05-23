export interface AdDetails {
  id: string;
  heading: string;
  make: string;
  model: string;
  year: string;
  price: string;
  transmission?: string;
  engine: string;
  engine_size: string;
  fuel_type: string;
  dealerName: string;
  phon: string;
  photos: string[];
  inventory_type: string;
  miles: string;
  first_seen_at: number;
  first_seen_at_date: string;
  last_seen_at: number;
  last_seen_at_date: string;
}