export const DODO_PRODUCT_MAP = {
    'pdt_0NbbbqCdfuGTpxX9KDNwm': {
        plan: 'professional',
        credits: 60,
        price: 19,
    },
    'pdt_0NbbbrHJcVDJqitCUkpjt': {
        plan: 'growth',
        credits: 300,
        price: 49,
    },
    'pdt_0NbbbqfeSmy9PD46q3jf3': {
        plan: 'enterprise',
        credits: 4000,
        price: 999,
    },
} as const;

export type DodoProductId = keyof typeof DODO_PRODUCT_MAP;
export type PlanType = typeof DODO_PRODUCT_MAP[DodoProductId]['plan'];
