/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect } from 'react';
import { analyzeFoodImage, type FoodAnalysis } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import StartScreen from './components/StartScreen';
import { LightbulbIcon, UploadIcon, NutritionIcon, RecipeIcon, ImageOffIcon, SparkleIcon } from './components/icons';


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Effect to run analysis when a new image is set
  useEffect(() => {
    if (!imageFile) return;

    // Create a temporary URL for the image preview
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);

    const performAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      setAnalysis(null);
      try {
        const result = await analyzeFoodImage(imageFile);
        setAnalysis(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to analyze the image. ${errorMessage}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();

    // Cleanup the object URL when the component unmounts or image changes
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      setError(null);
      setAnalysis(null);
      setImageFile(files[0]);
    }
  }, []);

  const handleReset = useCallback(() => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const renderContent = () => {
    if (!imageFile || !imageUrl) {
      return <StartScreen onFileSelect={handleFileSelect} />;
    }

    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-8 animate-fade-in">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Column */}
          <div className="flex flex-col gap-4">
            <img
              src={imageUrl}
              alt="Uploaded food"
              className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-square border-4 border-zinc-800"
            />
            <button
                onClick={handleReset}
                className="flex items-center justify-center text-center bg-zinc-800/80 border border-zinc-700 text-gray-200 font-semibold py-3 px-5 rounded-lg transition-all duration-200 ease-in-out hover:bg-zinc-700/80 hover:border-zinc-600 active:scale-95 text-base"
            >
                <UploadIcon className="w-5 h-5 mr-2" />
                Upload New Photo
            </button>
          </div>

          {/* Analysis Column */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-md min-h-[300px] flex flex-col">
            {isLoading && (
              <div className="m-auto text-center">
                <Spinner />
                <p className="mt-4 text-gray-400">Consulting the AI chef...</p>
              </div>
            )}

            {error && (
               <div className="m-auto text-center animate-fade-in bg-red-900/40 border border-red-500/30 p-6 rounded-lg flex flex-col items-center gap-4">
                <h2 className="text-xl font-bold text-red-300">Analysis Failed</h2>
                <p className="text-sm text-red-400 max-w-sm break-words whitespace-pre-wrap">{error}</p>
                <button
                    onClick={() => imageFile && setImageFile(new File([imageFile], imageFile.name, { type: imageFile.type }))}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors mt-2"
                  >
                    Try Again
                </button>
              </div>
            )}

            {analysis && !analysis.isFood && (
              <div className="m-auto text-center animate-fade-in bg-yellow-900/40 border border-yellow-500/30 p-8 rounded-lg flex flex-col items-center gap-4">
                <ImageOffIcon className="w-12 h-12 text-yellow-400" />
                <h2 className="text-xl font-bold text-yellow-300">That doesn't look like food...</h2>
                <p className="text-sm text-yellow-400 max-w-sm">
                  Our AI chef couldn't identify a dish in this image. Please try uploading a clear photo of food or a drink.
                </p>
              </div>
            )}

            {analysis && analysis.isFood && (
              <div className="space-y-8 text-gray-200 animate-fade-in overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-2">
                      <span className="mr-2 text-3xl">🍽️</span>{analysis.dishName}
                    </h2>
                </div>

                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-3 mb-3 text-stone-200"><RecipeIcon className="w-6 h-6 text-orange-400" />Recipe</h3>
                    <div className="space-y-4 pl-4 border-l-2 border-zinc-700">
                        <div>
                            <h4 className="font-bold text-lg text-stone-300">Ingredients:</h4>
                            <ul className="list-disc list-inside space-y-1 mt-2 text-stone-300 pl-2">
                                {analysis.recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-stone-300">Steps:</h4>
                            <ol className="list-decimal list-inside space-y-2 mt-2 text-stone-300 pl-2">
                                {analysis.recipe.steps.map((item, i) => <li key={i}>{item}</li>)}
                            </ol>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-3 mb-3 text-stone-200"><NutritionIcon className="w-6 h-6 text-orange-400" />Nutrition (per serving)</h3>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-black/30 p-3 rounded-lg"><span className="font-bold text-orange-300 block text-lg">~{analysis.nutrition.calories}</span> Calories</div>
                        <div className="bg-black/30 p-3 rounded-lg"><span className="font-bold text-orange-300 block text-lg">~{analysis.nutrition.protein}</span> Protein</div>
                        <div className="bg-black/30 p-3 rounded-lg"><span className="font-bold text-orange-300 block text-lg">~{analysis.nutrition.carbs}</span> Carbs</div>
                        <div className="bg-black/30 p-3 rounded-lg"><span className="font-bold text-orange-300 block text-lg">~{analysis.nutrition.fat}</span> Fat</div>
                    </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-3 mb-3 text-stone-200"><LightbulbIcon className="w-6 h-6 text-orange-400" />Healthier Variation</h3>
                  <div className="bg-green-900/30 border border-green-500/20 p-4 rounded-lg flex items-start gap-3">
                    <p className="text-green-200">{analysis.healthierVariation}</p>
                  </div>
                </div>

                {analysis.friendlyAdvice && (
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-3 mb-3 text-stone-200"><SparkleIcon className="w-6 h-6 text-orange-400" />Chef's Friendly Tip</h3>
                    <div className="bg-orange-900/30 border border-orange-500/20 p-4 rounded-lg flex items-start gap-3">
                      <p className="text-orange-200">{analysis.friendlyAdvice}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      <Header />
      <main className={`flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-8 flex justify-center ${!imageFile ? 'items-center' : 'items-start'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
