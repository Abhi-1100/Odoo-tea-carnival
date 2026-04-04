"use client";
import React from 'react';
import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen pb-20">
      {/* Top Navigation Anchor */}
      <nav className="w-full top-0 sticky z-40 bg-[#FDF9F1]/80 backdrop-blur-md flex justify-between items-center px-12 py-6 border-b border-outline-variant/10">
        <div className="flex items-center gap-8">
          <Link href="/menu" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
             <span className="material-symbols-outlined text-[#805600] text-3xl">arrow_back</span>
          </Link>
          <span className="text-2xl font-serif text-[#1C1C17] font-headline italic tracking-tight">Luminous Dining</span>
          <div className="hidden md:flex gap-8">
            <span className="text-[#805600] font-bold border-b-2 border-[#805600] py-1 transition-opacity duration-300">Signature</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F7F3EB] rounded-full text-[#805600] text-sm">
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            <span className="font-bold">4 ITEMS</span>
          </div>
          <span className="material-symbols-outlined text-[#1C1C17] opacity-70 cursor-pointer">account_circle</span>
        </div>
      </nav>

      <main className="min-h-screen px-6 md:px-12 py-16 lg:flex lg:gap-24 max-w-[1600px] mx-auto">
        {/* Order List Section */}
        <div className="flex-1">
          <div className="mb-12">
            <h1 className="text-5xl font-headline italic tracking-tight text-on-surface mb-2">Review Your Order</h1>
            <p className="text-on-surface-variant font-light tracking-wide uppercase text-xs">Table 14 • Est. Wait Time 22 Min</p>
          </div>

          {/* Bento Styled Item Grid */}
          <div className="space-y-8">
            {/* Item 1 */}
            <div className="group flex flex-col sm:flex-row gap-8 items-center p-6 bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(80,69,53,0.04)] hover:shadow-[0_20px_40px_rgba(80,69,53,0.08)] transition-all duration-300 border border-outline-variant/10">
              <div className="w-full sm:w-48 h-48 overflow-hidden rounded-lg bg-surface-container-high shrink-0">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Item" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbfgypz51Em2lZsagU8X3cyzJjyQfCAmQN_PbHO1xyY0s8yFrPQXB4FDV9ySOwide2w9ay4OlxsegMbR6wI3-aCUFb3H0-XyZ0uly5vxoVPqJBl7YLcntFt-zza8FxyzbEQMZ3QVhs_aBZh_dAEs3mzd2T4k6tnsY0DLUdwq-fn2jg6PX6d4MOhXKBpxFN89oKqV-Mx0DPPRDrMmdN3lWdga_YGJ9z6wxEgVfwiyl5FVEltfm7_XDv45vZrud_UfHf4pJc4c1_OYo"/>
              </div>
              <div className="flex-1 flex flex-col justify-between py-2 w-full">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-headline italic text-on-surface">The Curator's Wagyu</h3>
                    <span className="font-mono text-lg font-medium text-primary">$32.00</span>
                  </div>
                  <p className="text-sm text-on-surface-variant max-w-md mb-4 leading-relaxed">Caramelized balsamic onions, aged gruyère, truffle aioli on a toasted buttered brioche.</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 bg-surface-container-low px-3 py-1 rounded-full">
                    <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-colors">
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="font-mono font-semibold w-4 text-center">1</span>
                    <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-outline">Subtotal: <span className="font-mono text-on-surface ml-2">$32.00</span></span>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group flex flex-col sm:flex-row gap-8 items-center p-6 bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(80,69,53,0.04)] hover:shadow-[0_20px_40px_rgba(80,69,53,0.08)] transition-all duration-300 border border-outline-variant/10">
              <div className="w-full sm:w-48 h-48 overflow-hidden rounded-lg bg-surface-container-high shrink-0">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Item" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ9KAirhWPmC1z2G1nA5k4BRiYm_TWvB-3GSKT6Aqu511J66ZsrmWKVuhKzUrcQR4fXECOJ79R4EoaUFgll2QG8gLejqNAA32zqWWVmad-qsfWyMX5ppxi0E51qqbchs3XeEXg0ABMUMifRqZznJMZJvr4dI599FI_uO3PN6naVfoOehaw2o5VSlSX02AgGIVpQWBsrVSyvZnUCXpSlKXDxyIzLNIYwhul_fCxG5BvEMBFLFdFfIcqdQLNscB6sokAD6X53rIMZP4"/>
              </div>
              <div className="flex-1 flex flex-col justify-between py-2 w-full">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-headline italic text-on-surface">Heirloom &amp; Burrata</h3>
                    <span className="font-mono text-lg font-medium text-primary">$24.00</span>
                  </div>
                  <p className="text-sm text-on-surface-variant max-w-md mb-4 leading-relaxed">Seasonal heirloom tomatoes, cream-filled burrata, micro-basil, and 12-year aged Modena balsamic.</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 bg-surface-container-low px-3 py-1 rounded-full">
                    <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-colors">
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="font-mono font-semibold w-4 text-center">2</span>
                    <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-outline">Subtotal: <span className="font-mono text-on-surface ml-2">$48.00</span></span>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="group flex flex-col sm:flex-row gap-8 items-center p-6 bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(80,69,53,0.04)] hover:shadow-[0_20px_40px_rgba(80,69,53,0.08)] transition-all duration-300 border border-outline-variant/10">
              <div className="w-full sm:w-48 h-48 overflow-hidden rounded-lg bg-surface-container-high shrink-0">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Item" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz4OJSaQNzIFG_RqV1YXI4GEU5rvqXAY288DlFSNFbEk77jqC3SqttgrtDb-ScojJ-7415u2735pwR6nEafRzr2fcQg5OHcAkK_ZequY7wD6TNBgRpNBg9K_iV3A73vjOlDdDrY6omTq_sAJDsSKcXY9jclT2XJ9JOSqPM70UdtO3ZKUYuJTqzZgGAoL4nf-3D5wY03vmubjRSJ0wM3RVbm5W8mrQl4fsH490G0nCxri9e2J88IRpHsHvsSToP1y9riBnS-F0Pm74"/>
              </div>
              <div className="flex-1 flex flex-col justify-between py-2 w-full">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-headline italic text-on-surface">Domaine Serene Pinot</h3>
                    <span className="font-mono text-lg font-medium text-primary">$18.00</span>
                  </div>
                  <p className="text-sm text-on-surface-variant max-w-md mb-4 leading-relaxed">2019 Evenstad Reserve. Notes of black cherry, marionberry, and exotic spice.</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 bg-surface-container-low px-3 py-1 rounded-full">
                    <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-colors">
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="font-mono font-semibold w-4 text-center">1</span>
                    <button className="w-8 h-8 flex items-center justify-center text-primary hover:bg-white rounded-full transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-outline">Subtotal: <span className="font-mono text-on-surface ml-2">$18.00</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="mt-20">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-outline mb-8">Pair With Your Selection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg group cursor-pointer hover:bg-surface-container-high transition-colors">
                <div className="w-16 h-16 rounded overflow-hidden">
                  <img className="w-full h-full object-cover" alt="fries" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2PAAR5DNENg87ufsc5wfvn5NHJCQBRYRP8SuMtws1mNi_4Sa6o988N-VCeMKVqwEppKh14Sd_-jHD5NKJPcN6JwLRfLBrapFhUiCgXzYGUv4_taTn0_C7zA_8bXZSxDTnYxuRw7ILQ9UW6dINwpJwJIikUa3CTX0CU_yHIeL4JxSxZWPMuLCQZnipXz9gPM1g-ap2McWM3Y1btBqtPaLHMtnyAd3dwoJFgdGNhRgNqdD9FQ6MLxjMsMvHcVbS5B_cuIUnrBmblqA"/>
                </div>
                <div>
                  <p className="font-headline italic text-lg">Truffle Frites</p>
                  <p className="font-mono text-sm text-primary">+$12.00</p>
                </div>
                <button className="material-symbols-outlined ml-auto text-outline group-hover:text-primary transition-colors">add_circle</button>
              </div>
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg group cursor-pointer hover:bg-surface-container-high transition-colors">
                <div className="w-16 h-16 rounded overflow-hidden">
                  <img className="w-full h-full object-cover" alt="water" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9BzRTCTpVLFK_VhyZDq-eII_-m_8OV6YKz_Jp9iVIYM-6J6BVFhFRQ02B_w5b-0_kE_x0lNonJvogdGsaYpagfSSNrmaUk8J0kaxpT_oT_jgJ_0kqd2JNDJqHt3X625dPbPWIO-4KKErXoU-HSSBvNFyhQRYfNsNVrddUZquOutp4dFlYTQmqzCT_ARwwZotnXPq4CBW9QZFJoP2HcvH6MBmSNpUjxST_RanlYSjlzqKqxDGt-pDpHduW30Ls-SGoG69QYaQ0foY"/>
                </div>
                <div>
                  <p className="font-headline italic text-lg">San Pellegrino</p>
                  <p className="font-mono text-sm text-primary">+$8.00</p>
                </div>
                <button className="material-symbols-outlined ml-auto text-outline group-hover:text-primary transition-colors">add_circle</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <aside className="lg:w-96 mt-16 lg:mt-0 shrink-0">
          <div className="sticky top-32 p-10 bg-surface-container-low rounded-xl border border-outline-variant/15 flex flex-col gap-8 shadow-[0_40px_80px_rgba(80,69,53,0.03)] focus-within:ring-2 ring-primary">
            <div>
              <h2 className="text-3xl font-headline italic mb-1">Order Summary</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Payment due upon checkout</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">Subtotal</span>
                <span className="font-mono text-on-surface">$98.00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">Tax (8.5%)</span>
                <span className="font-mono text-on-surface">$8.33</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">Gratuity (18%)</span>
                <span className="font-mono text-on-surface">$17.64</span>
              </div>
              <div className="pt-4 mt-4 border-t border-outline-variant/30 flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-1">Total Amount</span>
                  <span className="text-4xl font-mono text-primary font-bold tracking-tighter">$123.97</span>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <button className="w-full py-5 rounded-lg bg-gradient-to-br from-[#805600] to-[#b07d5d] text-white font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-md">
                Proceed to Payment
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button className="w-full py-4 rounded-lg border border-outline-variant/20 text-on-surface-variant font-medium text-xs tracking-widest uppercase hover:bg-white transition-colors">
                Add Special Instructions
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4 p-4 bg-white/50 rounded-lg">
              <span className="material-symbols-outlined text-primary-container">verified_user</span>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                Secure transactional processing powered by <br/><span className="font-bold">LUMINOUS CURATOR™</span>
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Space */}
      <footer className="mt-12 px-12 py-12 border-t border-outline-variant/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-outline">
        <div>© {new Date().getFullYear()} Luminous Dining Group</div>
        <div className="flex gap-8">
          <a className="hover:text-primary transition-colors" href="#">Dietary Info</a>
          <a className="hover:text-primary transition-colors" href="#">Privacy</a>
          <a className="hover:text-primary transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
