function maskName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0][0] + "X".repeat(parts[0].length - 1);
  }
  const first = parts[0][0] + "X".repeat(parts[0].length - 1);
  const last = parts[1][0] + "X".repeat(parts[1].length - 1);
  return `${first} ${last}`;
}

function censoredDescription(): string {
  return "Unlock this investor's profile to view their full description.";
}

export interface LockedInvestor {
  id: number;
  name: string;
  about: string;
  city: string;
  country: string;
  preference_sector: string;
  firm_name: string;
  type?: string;
  locked: true;
}

export interface UnlockedInvestor {
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
  locked?: false;
}

export type MaskedInvestor = LockedInvestor | UnlockedInvestor;

export function maskInvestor<T extends Record<string, unknown>>(
  investor: T,
  isUnlocked: boolean,
): MaskedInvestor {
  if (isUnlocked) {
    return {
      id: investor.id as number,
      name: investor.name as string,
      about: investor.about as string,
      city: investor.city as string,
      country: investor.country as string,
      preference_sector: investor.preference_sector as string,
      firm_name: investor.firm_name as string,
      email: investor.email as string,
      linkedin: investor.linkedin as string,
      type: investor.type as string | undefined,
    };
  }

  return {
    id: investor.id as number,
    name: maskName(investor.name as string),
    about: censoredDescription(),
    city: investor.city as string,
    country: investor.country as string,
    preference_sector: investor.preference_sector as string,
    firm_name: investor.firm_name as string,
    type: investor.type as string | undefined,
    locked: true as const,
  };
}
