import { useSettings } from '../context/SettingsContext';

export default function SettingsModal({ onClose }) {
    const {
        bottleSizes,
        bottleDefinitions,
        updateBottleDefinition,
        safetyStockLoads,
        setSafetyStockLoads,
        resetDefaults
    } = useSettings();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 p-6 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Master Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 font-bold text-xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Safety Stock Rule */}
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                            Global Safety Stock Requirement (Full Loads)
                        </label>
                        <input
                            type="number"
                            value={safetyStockLoads}
                            onChange={(e) => setSafetyStockLoads(Number(e.target.value))}
                            className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-lg"
                        />
                        <p className="text-xs text-blue-700 mt-1">
                            Minimum inventory to hold in terms of Full Truck Loads.
                        </p>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Bottle Definitions */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Bottle Definitions</h3>
                        <div className="space-y-6">
                            {bottleSizes.map(size => (
                                <div key={size} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <h4 className="font-bold text-md text-gray-800 mb-3 border-b pb-2">{size} Configuration</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Bottles / Case</label>
                                            <input
                                                type="number"
                                                value={bottleDefinitions[size].bottlesPerCase}
                                                onChange={(e) => updateBottleDefinition(size, 'bottlesPerCase', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Bottles / Truck</label>
                                            <input
                                                type="number"
                                                value={bottleDefinitions[size].bottlesPerTruck}
                                                onChange={(e) => updateBottleDefinition(size, 'bottlesPerTruck', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Cases / Truck</label>
                                            <input
                                                type="number"
                                                value={bottleDefinitions[size].casesPerTruck}
                                                onChange={(e) => updateBottleDefinition(size, 'casesPerTruck', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Cases / Pallet</label>
                                            <input
                                                type="number"
                                                value={bottleDefinitions[size].casesPerPallet || 0}
                                                onChange={(e) => updateBottleDefinition(size, 'casesPerPallet', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg border-t">
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to reset all settings to factory defaults?')) {
                                resetDefaults();
                            }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Reset to Factory Defaults
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
