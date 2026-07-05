export interface Investor {
  id: number;
  name: string;
  about: string;
  city: string;
  country: string;
  preference_sector: string;
  firm_name: string;
  email: string;
  linkedin: string;
  type?: string;
  locked?: boolean;
}
