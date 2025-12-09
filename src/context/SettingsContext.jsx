import { createContext, useContext, useState, useEffect } from 'react';

const DEFAULTS = {
    bottleDefinitions: {
        '20oz': { bottlesPerCase: 12, bottlesPerTruck: 80784, casesPerTruck: 6732, casesPerPallet: 306, palletsPerTruck: 22 },
        '16.9oz': { bottlesPerCase: 24, bottlesPerTruck: 90288, casesPerTruck: 3762, casesPerPallet: 171, palletsPerTruck: 22 },
        '32oz': { bottlesPerCase: 15, bottlesPerTruck: 50820, casesPerTruck: 3388, casesPerPallet: 154, palletsPerTruck: 22 },
    },
    safetyStockLoads: 6,
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    // Initialize state from LocalStorage or Defaults
    const [bottleDefinitions, setBottleDefinitions] = useState(() => {
        const saved = localStorage.getItem('bottleDefinitions');
        return saved ? JSON.parse(saved) : DEFAULTS.bottleDefinitions;
    });

    const [safetyStockLoads, setSafetyStockLoads] = useState(() => {
        const saved = localStorage.getItem('safetyStockLoads');
        return saved ? JSON.parse(saved) : DEFAULTS.safetyStockLoads;
    });

    // Persist to LocalStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('bottleDefinitions', JSON.stringify(bottleDefinitions));
    }, [bottleDefinitions]);

    useEffect(() => {
        localStorage.setItem('safetyStockLoads', JSON.stringify(safetyStockLoads));
    }, [safetyStockLoads]);

    const updateBottleDefinition = (size, field, value) => {
        setBottleDefinitions(prev => ({
            ...prev,
            [size]: {
                ...prev[size],
                [field]: Number(value)
            }
        }));
    };

    const resetDefaults = () => {
        setBottleDefinitions(DEFAULTS.bottleDefinitions);
        setSafetyStockLoads(DEFAULTS.safetyStockLoads);
    };

    const value = {
        bottleDefinitions,
        safetyStockLoads,
        setSafetyStockLoads,
        updateBottleDefinition,
        resetDefaults,
        bottleSizes: Object.keys(DEFAULTS.bottleDefinitions)
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
