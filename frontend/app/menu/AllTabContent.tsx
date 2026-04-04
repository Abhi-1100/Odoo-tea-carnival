"use client";
import React from 'react';
import { CoffeeItem } from './ItemDetailModal';

interface AllTabContentProps {
  handleAddToCart: () => void;
  openItemModal?: (item: CoffeeItem) => void;
}

export default function AllTabContent({ handleAddToCart, openItemModal }: AllTabContentProps) {
  return (
    <div className="pt-8 pb-48 px-12 max-w-[1440px] mx-auto min-h-screen">
      {/* Section Header */}
      <div className="mb-16 flex flex-col gap-4">
        <div className="w-12 h-[2px] bg-primary"></div>
        <h1 className="text-6xl font-headline font-medium text-on-surface max-w-2xl leading-tight">Les Entrées Curées</h1>
        <p className="text-on-surface-variant font-body text-lg max-w-xl leading-relaxed">A refined selection of starters designed to awaken the palate, featuring locally sourced seasonal ingredients.</p>
      </div>
      
      {/* Bento Grid / Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Card 1 */}
        <div onClick={() => openItemModal?.({title: "Beetroot & Chèvre", description: "Roasted heirloom beets, whipped goat cheese, honeycomb", price: "$18.00", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrlc4YV4mSL2r2ZvWz_LTkobbCGuaDJ1ftLvgqtw1ZxrP4cf1UIsbBd1IVSxtkTljwdqyu39e7xh9sxcQabCZvlMTF1WxCp4yqjq9QPTBF5_RSiJhiJM9Bi1PysmDDszGOvGDcskO38LE5DHa7q7ow1Fd3fg-F8F5z2eafHK2Cs6n0zh-UPyAmf62TYlIWAYng0vXkRzBoIKvCWZA1m_t4epYLVg1VDw1xNV3Db1EZfX-uvXuV5FCL-ziq3r9-tWDjYYcq1-HHBNg"})} className="group flex flex-col gap-6 cursor-pointer">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container relative">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gourmet salad" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrlc4YV4mSL2r2ZvWz_LTkobbCGuaDJ1ftLvgqtw1ZxrP4cf1UIsbBd1IVSxtkTljwdqyu39e7xh9sxcQabCZvlMTF1WxCp4yqjq9QPTBF5_RSiJhiJM9Bi1PysmDDszGOvGDcskO38LE5DHa7q7ow1Fd3fg-F8F5z2eafHK2Cs6n0zh-UPyAmf62TYlIWAYng0vXkRzBoIKvCWZA1m_t4epYLVg1VDw1xNV3Db1EZfX-uvXuV5FCL-ziq3r9-tWDjYYcq1-HHBNg" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-headline text-2xl font-semibold">Beetroot &amp; Chèvre</h3>
              <p className="text-on-surface-variant text-sm font-body italic">Roasted heirloom beets, whipped goat cheese, honeycomb</p>
            </div>
            <span className="font-mono text-primary font-medium">18.00</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all pointer-events-none">
            <span className="w-8 h-px bg-primary/30"></span>
            <span>+ Add to Order</span>
          </button>
        </div>

        {/* Card 2 */}
        <div onClick={() => openItemModal?.({title: "Fine de Claire", description: "Half dozen oysters, champagne mignonette, fresh lemon", price: "$24.50", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzoBuhVyzNm3nq-T-sgRhUGaRbIH_go9mXH5fn-B2Qu2_sILVEUJYQkmBGV6jrhmK8b92_YO7YqgNRsosGKNmPl-UzyKr-8eQ12Lu5grNGDglaCUgmaQojc0zjwoT6XDLaPm3ABzglAphd-kbyEXyV5j96Pin2820IthU2nqLCf2IH06B1aBKCE6sEYJO__vqLAP_FYuASl-aZyg7IadSjiih5uTbmzW8PW9Gc1r4bvkTtcDem0AxO83Ynw4AG9857qn_j5z0Z48E"})} className="group flex flex-col gap-6 lg:mt-12 cursor-pointer">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container relative">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Oysters" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzoBuhVyzNm3nq-T-sgRhUGaRbIH_go9mXH5fn-B2Qu2_sILVEUJYQkmBGV6jrhmK8b92_YO7YqgNRsosGKNmPl-UzyKr-8eQ12Lu5grNGDglaCUgmaQojc0zjwoT6XDLaPm3ABzglAphd-kbyEXyV5j96Pin2820IthU2nqLCf2IH06B1aBKCE6sEYJO__vqLAP_FYuASl-aZyg7IadSjiih5uTbmzW8PW9Gc1r4bvkTtcDem0AxO83Ynw4AG9857qn_j5z0Z48E" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-headline text-2xl font-semibold">Fine de Claire</h3>
              <p className="text-on-surface-variant text-sm font-body italic">Half dozen oysters, champagne mignonette, fresh lemon</p>
            </div>
            <span className="font-mono text-primary font-medium">24.50</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all pointer-events-none">
            <span className="w-8 h-px bg-primary/30"></span>
            <span>+ Add to Order</span>
          </button>
        </div>

        {/* Card 3 */}
        <div onClick={() => openItemModal?.({title: "Yellowfin Tartare", description: "Sashimi grade tuna, avocado silk, crispy shallots", price: "$21.00", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKlsQV5xhOJTaTupy6B28ZSRShEDtFAspCfLPqEblzdjn0Ss2XvK95HotkaPyRmQ7md7fDSugmuAIanj_LHI5OubkFzZzVLXTi10SWXyxCBfdH6MnGu1lyoiFuMFgVo_dmfDQhNr67tWZN5C6WKnkfJaDz1KRu_fi38kdEI4KnJUEdZYTR5L-IsJl5PBruIypxQMr3jT2xF_WiEG4Go77dcXb-XDaIdnRJbi1Px8QNCqkwiCkdMVtnfO5fOodxq2GMKc5eWjV1WwM"})} className="group flex flex-col gap-6 cursor-pointer">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container relative">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Tartare" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKlsQV5xhOJTaTupy6B28ZSRShEDtFAspCfLPqEblzdjn0Ss2XvK95HotkaPyRmQ7md7fDSugmuAIanj_LHI5OubkFzZzVLXTi10SWXyxCBfdH6MnGu1lyoiFuMFgVo_dmfDQhNr67tWZN5C6WKnkfJaDz1KRu_fi38kdEI4KnJUEdZYTR5L-IsJl5PBruIypxQMr3jT2xF_WiEG4Go77dcXb-XDaIdnRJbi1Px8QNCqkwiCkdMVtnfO5fOodxq2GMKc5eWjV1WwM" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-headline text-2xl font-semibold">Yellowfin Tartare</h3>
              <p className="text-on-surface-variant text-sm font-body italic">Sashimi grade tuna, avocado silk, crispy shallots</p>
            </div>
            <span className="font-mono text-primary font-medium">21.00</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all pointer-events-none">
            <span className="w-8 h-px bg-primary/30"></span>
            <span>+ Add to Order</span>
          </button>
        </div>

        {/* Card 4 */}
        <div onClick={() => openItemModal?.({title: "Beef Carpaccio", description: "Truffle oil, parmigiano reggiano, wild arugula", price: "$19.50", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-PMS3KH9dw3cMfDL9HFxC9mP3bHBZt9fbuo9H3aDcG-W3nTX574G8tBXpjv4hXQZyWTMqgrfMZnV4yBWHXvcEKf0BlaycvbGoRcDejfQqCbsh90GgRfToFaburvhgCjIfvcvrmrlviQ4JW9A-s5lMxx4mLYqTHGPUPPcuJBXnpkA_ASXW_aoOfwOEjyrdzgL4UQ59Ee_n3YYqOpk2n5hCoKfVotV7SWFbfdTXFbn1zEeOZvjFfpAz1gdGnCtgv8Q6PkRsDvhwFsQ"})} className="group flex flex-col gap-6 -mt-8 cursor-pointer">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container relative">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Carpaccio" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-PMS3KH9dw3cMfDL9HFxC9mP3bHBZt9fbuo9H3aDcG-W3nTX574G8tBXpjv4hXQZyWTMqgrfMZnV4yBWHXvcEKf0BlaycvbGoRcDejfQqCbsh90GgRfToFaburvhgCjIfvcvrmrlviQ4JW9A-s5lMxx4mLYqTHGPUPPcuJBXnpkA_ASXW_aoOfwOEjyrdzgL4UQ59Ee_n3YYqOpk2n5hCoKfVotV7SWFbfdTXFbn1zEeOZvjFfpAz1gdGnCtgv8Q6PkRsDvhwFsQ" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-headline text-2xl font-semibold">Beef Carpaccio</h3>
              <p className="text-on-surface-variant text-sm font-body italic">Truffle oil, parmigiano reggiano, wild arugula</p>
            </div>
            <span className="font-mono text-primary font-medium">19.50</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all pointer-events-none">
            <span className="w-8 h-px bg-primary/30"></span>
            <span>+ Add to Order</span>
          </button>
        </div>

        {/* Card 5 */}
        <div onClick={() => openItemModal?.({title: "Seared Scallops", description: "Hokkaido scallops, garden pea puree, pancetta soil", price: "$26.00", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-8WEDjZGhrinxhhFZpRvbhilBHRcZofgtB-d67Ju-z19bsUAGEJS8IZcTceXQh7U7Ki_i-R9RkzBhCjC-xTeTJRhyVg3D_DZ6us_p_BgZ2zd3gOxeUwkCcM_hsFbytXCNDBRT6a_t00bxt3biKh63oNSbRykBIJ-iEopb5N4y7eDDCF9espyyxtY1gybu9f9pCO5rPK-fc8tqIl9TUNWsCVPpLzSsb7yVpfqYxui0X1a1QbimCav8FLdVRkAtF9roybiALGrd57w"})} className="group flex flex-col gap-6 cursor-pointer">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container relative">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Scallops" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-8WEDjZGhrinxhhFZpRvbhilBHRcZofgtB-d67Ju-z19bsUAGEJS8IZcTceXQh7U7Ki_i-R9RkzBhCjC-xTeTJRhyVg3D_DZ6us_p_BgZ2zd3gOxeUwkCcM_hsFbytXCNDBRT6a_t00bxt3biKh63oNSbRykBIJ-iEopb5N4y7eDDCF9espyyxtY1gybu9f9pCO5rPK-fc8tqIl9TUNWsCVPpLzSsb7yVpfqYxui0X1a1QbimCav8FLdVRkAtF9roybiALGrd57w" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-headline text-2xl font-semibold">Seared Scallops</h3>
              <p className="text-on-surface-variant text-sm font-body italic">Hokkaido scallops, garden pea puree, pancetta soil</p>
            </div>
            <span className="font-mono text-primary font-medium">26.00</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all pointer-events-none">
            <span className="w-8 h-px bg-primary/30"></span>
            <span>+ Add to Order</span>
          </button>
        </div>

        {/* Card 6 */}
        <div onClick={() => openItemModal?.({title: "Table Bread", description: "House-made sourdough, smoked sea salt butter", price: "$8.00", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfwO7xeAW30yLkzUOEfNdF5xymg78CCNyLhIhKiy22yP46i4nZ-qPuI9AKHeoiG6GhKRO36nn_D3K1pwqXO7x7GV0aMGwBm2rSXCj_SzeZouKtfpvDiJMh0O6OINBolxCbzsaC5JDYbZktFO8cbV9ii7nBqD6S_ZdiEETUhb_oYpy9SurJlfhnuWOVbHdA-Nq5Qgp-1wO4PyLVIa8QNT5su1LaPFgezml0Xwrk3d2g1-XhjQ2seRF33eOt8xFsNNnWIKAx-5n4ecY"})} className="group flex flex-col gap-6 lg:mt-24 cursor-pointer">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container relative">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Bread" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfwO7xeAW30yLkzUOEfNdF5xymg78CCNyLhIhKiy22yP46i4nZ-qPuI9AKHeoiG6GhKRO36nn_D3K1pwqXO7x7GV0aMGwBm2rSXCj_SzeZouKtfpvDiJMh0O6OINBolxCbzsaC5JDYbZktFO8cbV9ii7nBqD6S_ZdiEETUhb_oYpy9SurJlfhnuWOVbHdA-Nq5Qgp-1wO4PyLVIa8QNT5su1LaPFgezml0Xwrk3d2g1-XhjQ2seRF33eOt8xFsNNnWIKAx-5n4ecY" />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h3 className="font-headline text-2xl font-semibold">Table Bread</h3>
              <p className="text-on-surface-variant text-sm font-body italic">House-made sourdough, smoked sea salt butter</p>
            </div>
            <span className="font-mono text-primary font-medium">8.00</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-4 transition-all pointer-events-none">
            <span className="w-8 h-px bg-primary/30"></span>
            <span>+ Add to Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
