export const DODO_PRODUCT_MAP = {
    'pdt_UQVM7C1CCtMCSP1MFCx9m': {
        plan: 'professional',
        credits: 60,
        price: 15,
    },
    'pdt_cPLJVSbDTlp397NpGKoS4': {
        plan: 'growth',
        credits: 300,
        price: 49,
    },
    'pdt_vNXSWmxxgNRt1TzHQZDni': {
        plan: 'enterprise',
        credits: 999999,
        price: 999,
    },
} as const;

export type DodoProductId = keyof typeof DODO_PRODUCT_MAP;
export type PlanType = typeof DODO_PRODUCT_MAP[DodoProductId]['plan'];
