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
}

export const INVESTOR_LIST_COLUMNS =
  "id,name,about,city,country,preference_sector,firm_name,email,linkedin,type" as const;
