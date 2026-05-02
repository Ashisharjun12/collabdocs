import { cn } from "@/lib/utils";

export function Integrations() {
	return (
        <section className="py-32 px-6 md:px-10 bg-[#171717] border-b border-[#242424] overflow-hidden">
            <div className="max-w-6xl mx-auto grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
                {/* Left Content */}
                <div className="max-w-xl space-y-6">
                    <div className="text-[12px] font-medium text-[#3ecf8e] uppercase tracking-[1.2px] mb-4">Ecosystem</div>
                    <h2 className="text-3xl md:text-5xl font-medium text-[#fafafa] tracking-tight mb-6 leading-tight">
                        Seamlessly connected <br/>to your <span className="text-[#3ecf8e]">workflow</span>
                    </h2>
                    <p className="text-lg text-[#898989] font-normal leading-relaxed">
                        Flow integrates with your favorite tools to keep your documentation alive. 
                        Import assets, embed diagrams, and sync with your team's favorite platforms.
                    </p>
                    
                    <div className="pt-4 grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <h4 className="text-[14px] font-medium text-[#fafafa]">Native Embeds</h4>
                            <p className="text-[13px] text-[#4d4d4d]">Excalidraw, Miro, and more.</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[14px] font-medium text-[#fafafa]">Real-time Sync</h4>
                            <p className="text-[13px] text-[#4d4d4d]">Automatic vault backups.</p>
                        </div>
                    </div>
                </div>

                {/* Right Content - Visual Grid */}
                <div className="flex justify-center lg:justify-end">
                    <div className="relative size-[400px] md:size-[450px]">
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-[#3ecf8e]/5 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="relative grid grid-cols-5 gap-3 h-full w-full">
                            {tiles.map((tile, i) => (
                                <IntegrationCard key={i} {...tile} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function IntegrationCard({
    row,
    col,
    logo,
    isComingSoon
}) {
	return (
        <div
            className={cn(
                "absolute flex size-16 md:size-20 items-center justify-center rounded-2xl border transition-all duration-500 group",
                logo
					? "bg-[#1c1c1c] border-[#2e2e2e] shadow-xl hover:border-[#3ecf8e]/30 hover:bg-[#3ecf8e]/5"
					: "bg-[#171717] border-[#242424]/50"
            )}
            style={{
				left: col * (window.innerWidth < 768 ? 70 : 85),
				top: row * (window.innerWidth < 768 ? 70 : 85),
			}}>
            {logo && (
                <>
                    <img
                        alt={logo.alt}
                        className={cn(
                            "pointer-events-none size-8 md:size-10 select-none object-contain transition-transform duration-500 group-hover:scale-110",
                            logo.isInvertable && "invert opacity-80 group-hover:opacity-100"
                        )}
                        src={logo.src} 
                    />
                    {isComingSoon && (
                        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-[#3ecf8e] text-[#171717] text-[7px] font-bold uppercase tracking-wider rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Soon
                        </div>
                    )}
                </>
			)}
        </div>
    );
}

const tiles = [
	// Row 0
	{ row: 0, col: 1 },
	{
		row: 0,
		col: 3,
		logo: {
			src: "https://cdn.worldvectorlogo.com/logos/notion-2.svg",
			alt: "Notion",
            isInvertable: true
		},
	},

	// Row 1
	{ row: 1, col: 0 },
	{
		row: 1,
		col: 2,
		logo: {
			src: "https://excalidraw.com/favicon-32x32.png",
			alt: "Excalidraw",
		},
        isComingSoon: true
	},
	{
		row: 1,
		col: 4,
		logo: {
			src: "https://cdn.worldvectorlogo.com/logos/vercel.svg",
			alt: "Vercel",
			isInvertable: true,
		},
	},

	// Row 2
	{
		row: 2,
		col: 1,
		logo: {
			src: "https://cdn.worldvectorlogo.com/logos/figma-1.svg",
			alt: "Figma",
		},
        isComingSoon: true
	},
	{
		row: 2,
		col: 3,
		logo: {
			src: "https://cdn.worldvectorlogo.com/logos/google-gmail.svg",
			alt: "Gmail",
		},
	},

	// Row 3
	{ row: 3, col: 0 },
	{
		row: 3,
		col: 2,
		logo: {
			src: "https://cdn.worldvectorlogo.com/logos/supabase-1.svg",
			alt: "Supabase",
		},
	},
	{
		row: 3,
		col: 4,
		logo: {
			src: "https://cdn.worldvectorlogo.com/logos/miro-2.svg",
			alt: "Miro",
		},
        isComingSoon: true
	},

	// Row 4
	{
		row: 4,
		col: 1,
		logo: {
			src: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
			alt: "Slack",
		},
	},
	{
		row: 4,
		col: 3,
		logo: {
			src: "https://cdn.worldvectorlogo.com/logos/adobe-2.svg",
			alt: "Adobe",
		},
	},
];
