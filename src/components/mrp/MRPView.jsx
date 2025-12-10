import { useSettings } from '../../context/SettingsContext';

export default function MRPView({ state, setters, results }) {
    const { bottleSizes } = useSettings();

    if (!results) return <div>Loading...</div>;

    const { netInventory, safetyTarget, trucksToOrder, specs } = results;

    // Helpers for formatting
    const fmt = (n) => n.toLocaleString();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">📦 Inventory Inputs</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bottle Size</label>
                        <select
                            value={state.selectedSize}
                            onChange={(e) => setters.setSelectedSize(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg py-2"
                        >
                            {bottleSizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Production Schedule (Cases)</label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                                <div key={day}>
                                    <label className="block text-xs text-gray-500 uppercase font-bold mb-1">{day}</label>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min="0"
                                        value={state.weeklyDemand[day] || ''}
                                        onChange={(e) => setters.updateDailyDemand(day, e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1"
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Total Weekly Demand:</span>
                            <span className="text-lg font-bold text-gray-900">{state.totalScheduledCases.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Floor Inventory (Pallets)</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                min="0"
                                value={state.currentInventoryPallets || ''}
                                onChange={(e) => setters.setCurrentInventoryPallets(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Incoming Trucks</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                min="0"
                                value={state.incomingTrucks || ''}
                                onChange={(e) => setters.setIncomingTrucks(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg"
                                placeholder="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Confirmed deliveries.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-600 pb-2">📊 MRP Analysis</h2>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-gray-300">Net Inventory (Bottles)</span>
                            <span className={`text-2xl font-mono font-bold ${netInventory < safetyTarget ? 'text-red-400' : 'text-green-400'}`}>
                                {fmt(netInventory)}
                            </span>
                        </div>

                        <div className="flex justify-between items-end">
                            <span className="text-gray-300">Safety Target ({state.selectedSize})</span>
                            <span className="text-xl font-mono text-gray-400">
                                {fmt(safetyTarget)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 text-right -mt-4">
                            (Target = 6 Loads × {fmt(specs.bottlesPerTruck)})
                        </p>
                    </div>
                </div>

                <div className="mt-8 bg-gray-700 rounded-lg p-6 text-center border-2 border-gray-600">
                    <p className="text-gray-300 uppercase letter-spacing-wide text-sm font-bold mb-2">Replenishment Action</p>
                    <div className="text-5xl font-extrabold text-blue-400">
                        {trucksToOrder > 0 ? (
                            <span>{trucksToOrder} TRUCKS</span>
                        ) : (
                            <span className="text-green-400">✅ OK</span>
                        )}
                    </div>
                    {trucksToOrder > 0 && (
                        <p className="text-red-300 mt-2 font-medium animate-pulse">
                            Below Safety Stock! Order immediately.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
