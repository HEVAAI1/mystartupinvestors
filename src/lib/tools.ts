export type Tool = {
  name: string;
  description: string;
  route: string;
  category: string;
  icon: string;
};

export const tools: Tool[]  = [
    {
        name: "Advanced Valuation Engine",
        description: "Calculate pre-money and post-money valuation using the VC method",
        route: "/tools-for-founders/advanced-valuation-engine",
        category: "Fundraising",
        icon: "💰",
    },
    {
        name: "Break-Even Calculator",
        description: "Determine when your startup will become profitable",
        route: "/tools-for-founders/break-even-calculator",
        category: "Financial Planning",
        icon: "📊",
    },
    {
        name: "Burn Rate & Runway Calculator",
        description: "Track your cash burn and calculate remaining runway",
        route: "/tools-for-founders/burn-rate-calculator",
        category: "Financial Planning",
        icon: "🔥",
    },
    {
        name: "CAC Optimizer",
        description: "Optimize customer acquisition costs across channels",
        route: "/tools-for-founders/cac-optimizer",
        category: "Growth Metrics",
        icon: "📈",
    },
    {
        name: "Cap Table Model",
        description: "Model equity dilution and ownership across funding rounds",
        route: "/tools-for-founders/cap-table-model",
        category: "Fundraising",
        icon: "📋",
    },
    {
        name: "Churn Rate Calculator",
        description: "Calculate customer and revenue churn for subscription businesses",
        route: "/tools-for-founders/churn-rate-calculator",
        category: "Growth Metrics",
        icon: "📉",
    },
    {
        name: "DCF Calculator",
        description: "Calculate enterprise value using discounted cash flows",
        route: "/tools-for-founders/dcf-calculator",
        category: "Fundraising",
        icon: "🔮",
    },
    {
        name: "Fundraising Calculator",
        description: "Calculate how much to raise and dilution impact",
        route: "/tools-for-founders/fundraising-calculator",
        category: "Fundraising",
        icon: "🤝",
    },
    {
        name: "Investability Score",
        description: "Score your startup across team, market, and traction",
        route: "/tools-for-founders/investability-score-calculator",
        category: "Fundraising",
        icon: "⭐",
    },
    {
        name: "IRR Calculator",
        description: "Calculate Internal Rate of Return for investments",
        route: "/tools-for-founders/irr-calculator",
        category: "Fundraising",
        icon: "🎯",
    },
];