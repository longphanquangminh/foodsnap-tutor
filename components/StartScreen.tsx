/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { UploadIcon, RecipeIcon, NutritionIcon, ChefHatIcon } from './icons';

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  return (
    <div 
      className={`w-full max-w-5xl mx-auto text-center p-8 transition-all duration-300 rounded-2xl border-2 ${isDraggingOver ? 'bg-orange-500/10 border-dashed border-orange-400' : 'border-transparent'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        onFileSelect(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-100 sm:text-6xl md:text-7xl">
          Your Personal AI <span className="text-orange-400">Chef & Nutritionist</span>.
        </h1>
        <p className="max-w-2xl text-lg text-gray-400 md:text-xl">
          Snap a photo of your meal to instantly get the recipe, nutritional info, and healthy cooking tips.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
            <label htmlFor="image-upload-start" className="relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-orange-600 rounded-full cursor-pointer group hover:bg-orange-500 transition-colors">
                <UploadIcon className="w-6 h-6 mr-3 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg] group-hover:scale-110" />
                Upload a Photo
            </label>
            <input id="image-upload-start" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <p className="text-sm text-gray-500">or drag and drop a file</p>
        </div>

        <div className="mt-16 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-zinc-900/70 p-6 rounded-lg border border-zinc-800 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-zinc-800 rounded-full mb-4">
                       <ChefHatIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Instant Analysis</h3>
                    <p className="mt-2 text-gray-400">Our AI identifies your dish from a single photo, even suggesting alternatives if it's unsure.</p>
                </div>
                <div className="bg-zinc-900/70 p-6 rounded-lg border border-zinc-800 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-zinc-800 rounded-full mb-4">
                       <RecipeIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Detailed Recipes</h3>
                    <p className="mt-2 text-gray-400">Get a complete, step-by-step recipe to recreate the meal in your own kitchen.</p>
                </div>
                <div className="bg-zinc-900/70 p-6 rounded-lg border border-zinc-800 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-zinc-800 rounded-full mb-4">
                       <NutritionIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-100">Nutrition & Health</h3>
                    <p className="mt-2 text-gray-400">Receive estimated nutrition facts and a smart tip for making the dish even healthier.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;