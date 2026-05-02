import { FullWidthDivider } from "./ui/full-width-divider";
import { Button } from "./ui/button";
import { CheckIcon } from "lucide-react";

const pricingPlans = [
	{
		name: "STARTER",
		price: "Free",
		description: "For individuals and side projects",
		featuresTitle: "FREE, FOREVER:",
		features: [
			"Unlimited Documents",
			"5 Workspaces",
			"Real-time Collaboration",
			"7-day Version History",
		],
		href: "/signup",
	},
	{
		name: "SCALE",
		isPopular: true,
		href: "/signup",
		price: "$12",
		period: "month",
		description: "For high-performance teams",
		featuresTitle: "EVERYTHING IN STARTER, PLUS:",
		features: [
			"Unlimited Workspaces",
			"Infinite Version History",
			"Advanced Analytics",
			"R2 Asset Vault",
			"Priority AI Access",
		],
	},
];

export function PricingSection() {
	return (
        <section
            id="pricing"
            className="w-full bg-[#171717] border-y border-[#242424] overflow-hidden">
            <div className="relative w-full">
				<FullWidthDivider position="top" className="opacity-10" />
				<FullWidthDivider position="bottom" className="opacity-10" />

				<div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-[#1c1c1c]">
					
                    {/* Header Card - Spans 2 columns on desktop */}
                    <div className="flex flex-col bg-[#171717] p-12 md:p-20 md:col-span-2 justify-center border-b md:border-b-0 md:border-r border-[#242424]">
						<p className="mb-6 text-[#3ecf8e] text-[10px] font-bold uppercase tracking-[2.5px]">
							TRANSPARENT PRICING
						</p>
						<h1 className="font-medium text-[#fafafa] text-4xl md:text-7xl leading-[1.1] tracking-tighter mb-8">
							Pricing that <br/> <span className="text-[#3ecf8e]">actually</span> makes sense
						</h1>
                        <p className="text-[#898989] text-lg md:text-xl max-w-md leading-relaxed font-normal">
                            Choose the plan that fits your team's size and speed. No hidden fees, no complexity.
                        </p>
					</div>

					{pricingPlans.map((plan) => (
						<PricingCard key={plan.name} plan={plan} />
					))}
				</div>
			</div>
        </section>
    );
}

function PricingCard({
    plan
}) {
	return (
        <div className="flex flex-col bg-[#171717] border-b lg:border-b-0 lg:border-r border-[#242424] last:border-r-0 transition-colors duration-500 hover:bg-[#1c1c1c]/50 group">
            <div className="p-10 md:p-12 border-b border-[#242424]">
				<p className="mb-8 text-[#4d4d4d] text-[10px] font-bold uppercase tracking-[2.5px] group-hover:text-[#3ecf8e] transition-colors">
					{plan.name}
				</p>
				<div className="mb-4 flex items-baseline gap-2">
					<h2 className="font-medium text-[#fafafa] text-5xl md:text-6xl tracking-tighter">{plan.price}</h2>
					{plan.period && (
						<span className="text-[#4d4d4d] font-medium text-sm">
							/ {plan.period}
						</span>
					)}
				</div>
				<p className="mb-12 text-[#898989] text-sm leading-relaxed font-normal min-h-[40px]">
					{plan.description}
				</p>

				<Button
                    asChild
                    className={`w-full py-7 rounded-full text-[14px] font-medium transition-all duration-500 shadow-2xl ${plan.isPopular ? 'bg-[#3ecf8e] text-[#171717] hover:bg-[#00c573] hover:scale-[1.03]' : 'bg-[#1c1c1c] border border-[#2e2e2e] text-[#fafafa] hover:bg-[#2e2e2e] hover:border-[#3ecf8e]/30'}`}
                >
					<a href={plan.href}>Get started</a>
				</Button>
			</div>
            <div className="p-10 md:p-12 space-y-5 bg-[#171717] group-hover:bg-transparent transition-colors">
				<p className="mb-10 text-[9px] font-bold text-[#4d4d4d] uppercase tracking-[2.5px]">{plan.featuresTitle}</p>

				{plan.features.map((feature) => (
					<p className="flex items-center gap-4 text-[#fafafa]/90 text-[14px] font-normal group-hover:translate-x-1 transition-transform duration-300" key={feature}>
						<div className="size-5 rounded-full bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 flex items-center justify-center group-hover:bg-[#3ecf8e]/20 transition-colors">
                            <CheckIcon className="size-3 text-[#3ecf8e]" />
                        </div>
						{feature}
					</p>
				))}
			</div>
        </div>
    );
}
