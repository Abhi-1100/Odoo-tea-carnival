export default function MenuPage() {
  return (
    <>
      <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-hidden min-h-screen">
        
        {/* SideNavBar: Hidden-on-hover specialty implementation */}
        <aside className="fixed left-0 top-0 h-full w-[280px] -translate-x-[268px] hover:translate-x-0 transition-transform duration-500 ease-in-out z-[100] bg-surface-container-lowest/80 backdrop-blur-[20px] shadow-[40px_0_80px_rgba(80,69,53,0.04)] group border-r border-outline-variant/15">
          <div className="flex flex-col py-12 pr-4 h-full">
            {/* Handle indicator */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-12 bg-primary-container rounded-l-full opacity-60 group-hover:opacity-0 transition-opacity"></div>
            <div className="px-8 mb-12">
              <h2 className="font-headline text-xl italic text-on-surface">The Curator</h2>
              <p className="font-label uppercase tracking-[0.1em] text-[10px] text-on-surface-variant opacity-60">Select your craft</p>
            </div>
            <nav className="flex-1 space-y-2">
              {/* Tab: Signature (Active) */}
              <a className="flex items-center gap-4 px-8 py-4 text-primary font-bold bg-surface-container-low rounded-r-full transition-all cursor-pointer">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="font-label uppercase tracking-[0.1em] text-[12px]">Signature</span>
              </a>
              {/* Tab: Espresso */}
              <a className="flex items-center gap-4 px-8 py-4 text-on-surface/50 hover:bg-surface-container-low hover:text-primary transition-all group/item cursor-pointer">
                <span className="material-symbols-outlined">coffee</span>
                <span className="font-label uppercase tracking-[0.1em] text-[12px]">Espresso</span>
              </a>
              {/* Tab: Pourover */}
              <a className="flex items-center gap-4 px-8 py-4 text-on-surface/50 hover:bg-surface-container-low hover:text-primary transition-all group/item cursor-pointer">
                <span className="material-symbols-outlined">coffee_maker</span>
                <span className="font-label uppercase tracking-[0.1em] text-[12px]">Pourover</span>
              </a>
              {/* Tab: Pastries */}
              <a className="flex items-center gap-4 px-8 py-4 text-on-surface/50 hover:bg-surface-container-low hover:text-primary transition-all group/item cursor-pointer">
                <span className="material-symbols-outlined">bakery_dining</span>
                <span className="font-label uppercase tracking-[0.1em] text-[12px]">Pastries</span>
              </a>
              {/* Tab: Merch */}
              <a className="flex items-center gap-4 px-8 py-4 text-on-surface/50 hover:bg-surface-container-low hover:text-primary transition-all group/item cursor-pointer">
                <span className="material-symbols-outlined">local_mall</span>
                <span className="font-label uppercase tracking-[0.1em] text-[12px]">Merch</span>
              </a>
            </nav>
            <div className="px-8 mt-auto pt-8">
              <div className="p-4 rounded-xl bg-surface-container-low/50">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Current Loyalty</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-headline italic text-primary">1,240</span>
                  <span className="font-label text-[10px] text-on-surface-variant">PTS</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="ml-3 min-h-screen pt-24 pb-32 px-6 md:px-16 lg:px-24">
          {/* TopAppBar Fragment */}
          <header className="mb-16 flex justify-between items-end">
            <div className="space-y-2">
              <span className="font-label uppercase tracking-[0.2em] text-[12px] text-primary font-semibold">Limited Series</span>
              <h1 className="text-6xl md:text-8xl font-headline italic tracking-tighter text-on-surface">Signature Blends</h1>
            </div>
            <div className="hidden lg:flex items-center gap-8 pb-4">
              <div className="text-right">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Filter by Profile</p>
                <div className="flex gap-4 mt-2">
                  <button className="text-primary border-b border-primary/20 pb-1 text-sm font-medium">All</button>
                  <button className="text-on-surface/40 hover:text-primary transition-colors text-sm font-medium">Bright</button>
                  <button className="text-on-surface/40 hover:text-primary transition-colors text-sm font-medium">Earthy</button>
                </div>
              </div>
            </div>
          </header>

          {/* Product Grid: Asymmetric Bento-inspired layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Primary Featured Card */}
            <div className="lg:col-span-8 group relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(80,69,53,0.06)] hover:shadow-[0_30px_60px_rgba(80,69,53,0.1)] transition-all duration-500">
              <div className="flex flex-col md:flex-row h-full">
                <div className="md:w-3/5 relative h-80 md:h-auto overflow-hidden">
                  <img alt="Featured Coffee" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwIovOqeVM510QP1TxZIb8MstzzWKA9ulm2BkWpx_zHFAEcjEhIOq8dygcGUu1SB0zIuXYJICTC9xIfgM5xzn764H6-r1xQ0iJpH48YFz4HitcZeYQ0EX6HfCuqwNc67SawLqw24W53xC6IPnOq5OMFNKVIFy2X26LqEiMCwya5Gs2z8NjQnLEtkjh3nuc8FBE7DqWv2exKseCCFIheHHeYhdpoWOG4P-RcysprjXcETCd65WcI6Gr_Zioy8zb4X0hmiwdaH-jR30"/>
                  <div className="absolute top-6 left-6 amber-gradient px-4 py-1 rounded-full">
                    <span className="text-[10px] font-label text-on-primary uppercase tracking-[0.2em]">Seasonal Peak</span>
                  </div>
                </div>
                <div className="md:w-2/5 p-8 lg:p-12 flex flex-col justify-between">
                  <div>
                    <h3 className="text-4xl font-headline italic mb-4 leading-tight">Amber Solstice Reserve</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-6">A curated blend of high-altitude Ethiopian beans with notes of toasted honeycomb and wild jasmine.</p>
                    <div className="flex items-center gap-2 mb-8">
                      <span className="material-symbols-outlined text-primary text-sm">notes</span>
                      <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Honey • Jasmine • Citrus</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-label text-xl text-on-surface">$12.50</span>
                    <button className="amber-gradient w-12 h-12 rounded-full flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Card */}
            <div className="lg:col-span-4 group bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_rgba(80,69,53,0.04)] flex flex-col justify-between border border-outline-variant/10">
              <div className="relative h-48 mb-8 overflow-hidden rounded-lg">
                <img alt="Velvet Espresso" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnsdqFEHEuTaEJzizSzsZMBwW2z_CCWJ11gG8Sh41AygkEbWBRFn_gLNTboc7puLkTuVjqFuhWBgtXH0fF8diacwlAQt3fBRRfVrek8mW2J_WHhyXtouC3Q799IFu-dtRzkGvfXuhC9kmQask6kxEVV34ltzov3m4Yc10riHXV_1iqucwrH1Sf1gLB2Bqr5ZY2HRCjYYCblklCbd8kwqiSnqQilzrTrAOD9egx4mKHAWeNvNeAWOT8n5IcwxINL4ciGJ8DleHLzew"/>
              </div>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-headline italic">Velvet Espresso</h3>
                  <span className="font-label text-sm">$6.00</span>
                </div>
                <p className="text-on-surface-variant text-xs mb-6">Concentrated luxury. Dark cocoa finish with a velvety mouthfeel.</p>
              </div>
              <button className="w-full py-3 border border-outline-variant/30 font-label text-[10px] uppercase tracking-widest hover:bg-surface-container-low hover:border-primary transition-all">
                Customize &amp; Add
              </button>
            </div>

            {/* Grid Items (Smaller Cards) */}
            <div className="lg:col-span-4 group bg-surface-container-lowest rounded-xl p-6 shadow-[0_20px_40px_rgba(80,69,53,0.04)] border border-outline-variant/10">
              <div className="aspect-square mb-6 overflow-hidden rounded-lg bg-surface-container-low">
                <img alt="Cloud Pourover" className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADMOuk1ICg6bH-Y44jFmX3pOman_6MpP6CyUNXmeWbRS0KDTbL3keSnk5tfGNCI2bSJE1YbZEJw4aPgPHdJn2lpKWundKUr0Y3BUPhBqm9C33nMhd7enDUrbgKiMBFqMPt-7G4A9P6EnuWBdbptEEFtoadsRQR_ea1kBN-sOtS4luotuWoaCpOWRSBa2uYutLYK9vvVuIoaq1HNMSA43FdXeHAmu2c6CToGptZHcJp4UW87o8YnKgnyygrwZU_ph6Vxnt1Q2eX7IM"/>
              </div>
              <h3 className="text-xl font-headline italic mb-1">Cloud Pourover</h3>
              <p className="text-on-surface-variant text-xs mb-4">Clean, tea-like clarity with floral aromas.</p>
              <div className="flex justify-between items-center">
                <span className="font-label text-sm text-on-surface">$8.50</span>
                <button className="text-primary hover:text-primary-container transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 group bg-surface-container-lowest rounded-xl p-6 shadow-[0_20px_40px_rgba(80,69,53,0.04)] border border-outline-variant/10">
              <div className="aspect-square mb-6 overflow-hidden rounded-lg bg-surface-container-low">
                <img alt="Golden Croissant" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8y-PV3S-4CJKGM0i8PWO6Tu21llE0CE7kHBKyssw_Z2sgJcXIM5PtdBHe72TifUFaySbvdfz6AxW-Fta2Weh9mphdLBp7l7yVOC_a1YfyXPrpJOvQ88e1FvhtkPs2E7XipzszI63tBKrQKTO89ncBjK_elOBNWcQI7COPDroDG-d_X85TrRPLfS36B5glOc97c2PWwFJR3qmiHs-uWFmcY5Q---9rOmbiI6ph3CwL7B_GLpq38odEA3PZy5iVRdKbDZicZ9UW_7g"/>
              </div>
              <h3 className="text-xl font-headline italic mb-1">Golden Croissant</h3>
              <p className="text-on-surface-variant text-xs mb-4">Double-laminated with Isigny Sainte-Mère butter.</p>
              <div className="flex justify-between items-center">
                <span className="font-label text-sm text-on-surface">$5.25</span>
                <button className="text-primary hover:text-primary-container transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 group bg-surface-container-lowest rounded-xl p-6 shadow-[0_20px_40px_rgba(80,69,53,0.04)] border border-outline-variant/10">
              <div className="aspect-square mb-6 overflow-hidden rounded-lg bg-surface-container-low">
                <img alt="Nocturne Cold Brew" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1ySCF8XtWbp5jSFpEdzGaNSq3fpk9wUcHvSqf1epTC6qeRjbMYl3ZFJ1YrdVRLUbWQMNzZz8JjLrrTAMDFoOZ_Y8nh2Lc5wLn30ETamNbBw898zuhoJeZysteVLLXofP6sMA6NJbq7pjBU43KVJyxY2g_KDRB6taOmOj6K7rUS42d6pHt6BZW5eXzSLHLqJtCmbSwZlstdBCPrAkzsC4xySGgSymJoGL5qPpIS_VsFS_7XfE9rmINqeBKDmxSODD3QXYuzcdx1BA"/>
              </div>
              <h3 className="text-xl font-headline italic mb-1">Nocturne Cold Brew</h3>
              <p className="text-on-surface-variant text-xs mb-4">24-hour slow steep for ultimate smoothness.</p>
              <div className="flex justify-between items-center">
                <span className="font-label text-sm text-on-surface">$7.00</span>
                <button className="text-primary hover:text-primary-container transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Additional Editorial Section */}
          <section className="mt-32 border-t border-outline-variant/20 pt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-headline italic mb-6">Our Roasting Philosophy</h2>
              <p className="text-on-surface-variant leading-relaxed mb-8 max-w-md">Every bean is traced to its origin, honoring the hands that harvested it. We roast in small batches to preserve the volatile aromatics that define a truly superior cup.</p>
              <a className="inline-flex items-center gap-2 font-label text-[10px] uppercase tracking-[0.2em] text-primary group cursor-pointer">
                Read Our Story 
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
            <div className="relative h-64 overflow-hidden rounded-xl">
              <img alt="Roastery" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFiJeKEF16VBRIidAPXZB4XCQ_1PEkTNJZMQVxLVULLeHutoPeIh3etPjPAOdGXsrVnHT9Oafl1V_Ye-KEDuf77Ez6NkNvvVwi-DK_6Qr_Yq6gt5YeJ1c_KQlND0r3zBdBAb2YGx3H_A5a3AfmeSl78ePldoFpy2EtyqfP5396hL1yabKf5fnBbHcPGpLi46CwKO-J9qIg2KN0DdGKNIjsOs7VYC3JOpEDxuRqKhDi3SaWQdTcAUReuySV8eVXrcOwVhGeGzECa78"/>
            </div>
          </section>
        </main>

        {/* Floating Cart: Pill-style bottom-docked summary */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50">
          <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-full py-3 pl-8 pr-3 flex items-center justify-between shadow-[0_20px_50px_rgba(80,69,53,0.15)] border border-outline-variant/10">
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest overflow-hidden">
                  <img alt="Item" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRdfpvyoqLgM0VZc6LS9xd6cNGXKBmICRX49Dg2X5dXJjPdIxPu3NBSzgOoEMsEdDcFAB_Q2TmKyVo6JD6wg-DQ2_9kr0WIfNcqzOcic2jaO9zPy_UAdm87FNPXCYvS4MFKWOjLf_2709VgTTmNKBXboNW1LdsgsQZyQybd66LhWjfr1RbL1aUF7DsOLAD3Nx-SjZfFqysDctRyVvNiVBNG5n80lLKhVpQySu65aNADEQDN2aTCfmKbvP2MBUxI0UBdJnQ426PXQg"/>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-primary-container flex items-center justify-center">
                  <span className="text-[10px] font-bold text-on-primary-container">+2</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Your Basket</p>
                <p className="font-headline italic text-lg text-on-surface">3 items • $18.50</p>
              </div>
            </div>
            <button className="amber-gradient text-on-primary font-label text-[12px] uppercase tracking-widest py-4 px-10 rounded-full flex items-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-primary/20">
              Review Order
              <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
