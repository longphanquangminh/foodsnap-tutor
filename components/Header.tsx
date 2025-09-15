/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ChefHatIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-8 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-center gap-3">
          <ChefHatIcon className="w-7 h-7 text-orange-400" />
          <h1 className="text-xl font-bold tracking-tight text-gray-100">
            FoodSnap Tutor
          </h1>
      </div>
    </header>
  );
};

export default Header;