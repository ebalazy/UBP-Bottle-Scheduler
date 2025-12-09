import { useState, useMemo, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export function useMRP() {
    const { bottleDefinitions, safetyStockLoads } = useSettings();

    // Form State with Persistence
    const [selectedSize, setSelectedSize] = useState(() => localStorage.getItem('mrp_selectedSize') || '20oz');


    // Weekly Demand State (Mon-Sun)
    const [weeklyDemand, setWeeklyDemand] = useState(() => {
        const saved = localStorage.getItem('mrp_weeklyDemand');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Basic validation to ensure it's an object
                if (typeof parsed === 'object' && parsed !== null) return parsed;
            } catch (e) {
                // Ignore parse error, fall back
            }
        }
        // Legacy migration: check for old key
        const oldScalar = localStorage.getItem('mrp_scheduledCases');
        if (oldScalar) {
            return { mon: Number(oldScalar), tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
        }
        return { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
    });

    // Derived total for calculations
    const totalScheduledCases = Object.values(weeklyDemand).reduce((a, b) => a + (Number(b) || 0), 0);
    const [currentInventoryPallets, setCurrentInventoryPallets] = useState(() => Number(localStorage.getItem('mrp_currentInventoryPallets')) || 0); // Pallets
    const [incomingTrucks, setIncomingTrucks] = useState(() => Number(localStorage.getItem('mrp_incomingTrucks')) || 0); // Trucks

    // Persistence Effects
    useEffect(() => localStorage.setItem('mrp_selectedSize', selectedSize), [selectedSize]);
    useEffect(() => localStorage.setItem('mrp_selectedSize', selectedSize), [selectedSize]);
    useEffect(() => localStorage.setItem('mrp_weeklyDemand', JSON.stringify(weeklyDemand)), [weeklyDemand]);
    useEffect(() => localStorage.setItem('mrp_currentInventoryPallets', currentInventoryPallets), [currentInventoryPallets]);
    useEffect(() => localStorage.setItem('mrp_incomingTrucks', incomingTrucks), [incomingTrucks]);


    const calculations = useMemo(() => {
        const specs = bottleDefinitions[selectedSize];
        if (!specs) return null;

        // Convert everything to Bottles for calculation
        const demandBottles = totalScheduledCases * specs.bottlesPerCase;
        const incomingBottles = incomingTrucks * specs.bottlesPerTruck;

        // Inventory: Pallets -> Cases -> Bottles
        // Fallback for casesPerPallet if undefined (migration) is to assume 0 until set, or a safe default.
        // We set defaults in context, but let's be safe.
        const csm = specs.casesPerPallet || 0;
        const inventoryBottles = currentInventoryPallets * csm * specs.bottlesPerCase;

        // Net Inventory = (Current + Incoming) - Demand
        const netInventory = (inventoryBottles + incomingBottles) - demandBottles;

        // Safety Target = Safety Stock Loads * Bottles/Truck
        const safetyTarget = safetyStockLoads * specs.bottlesPerTruck;

        // Trucks needed
        let trucksToOrder = 0;
        if (netInventory < safetyTarget) {
            const deficit = safetyTarget - netInventory;
            trucksToOrder = Math.ceil(deficit / specs.bottlesPerTruck);
        }

        // Safety Status (for simple UI feedback, separate from generic Risk Alert)
        const weeksOfStock = demandBottles > 0 ? (netInventory / demandBottles) : 0; // Rough estimate if daily demand was == scheduled cases (but that's just single day)

        return {
            netInventory, // Bottles
            safetyTarget, // Bottles
            trucksToOrder,
            specs // Pass specs through for UI convenience
        };
    }, [selectedSize, totalScheduledCases, currentInventoryPallets, incomingTrucks, bottleDefinitions, safetyStockLoads]);

    const updateDailyDemand = (day, value) => {
        setWeeklyDemand(prev => ({
            ...prev,
            [day]: Number(value)
        }));
    };

    return {
        formState: {
            selectedSize,
            weeklyDemand,
            totalScheduledCases,
            currentInventoryPallets,
            incomingTrucks
        },
        setters: {
            setSelectedSize,
            updateDailyDemand,
            setCurrentInventoryPallets: (v) => setCurrentInventoryPallets(Number(v)),
            setIncomingTrucks: (v) => setIncomingTrucks(Number(v))
        },
        results: calculations
    };
}
