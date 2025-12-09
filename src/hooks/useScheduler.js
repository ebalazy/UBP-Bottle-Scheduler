import { useState, useMemo, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

export function useScheduler() {
    const { bottleDefinitions, safetyStockLoads } = useSettings();

    const [selectedSize, setSelectedSize] = useState(() => localStorage.getItem('sched_selectedSize') || '20oz');
    const [targetDailyProduction, setTargetDailyProduction] = useState(() => Number(localStorage.getItem('sched_targetDailyProduction')) || 0); // Cases
    const [shiftStartTime, setShiftStartTime] = useState(() => localStorage.getItem('sched_shiftStartTime') || '00:00');

    useEffect(() => localStorage.setItem('sched_selectedSize', selectedSize), [selectedSize]);
    useEffect(() => localStorage.setItem('sched_targetDailyProduction', targetDailyProduction), [targetDailyProduction]);
    useEffect(() => localStorage.setItem('sched_shiftStartTime', shiftStartTime), [shiftStartTime]);

    const [poAssignments, setPoAssignments] = useState(() => {
        const saved = localStorage.getItem('sched_poAssignments');
        return saved ? JSON.parse(saved) : {};
    });
    useEffect(() => localStorage.setItem('sched_poAssignments', JSON.stringify(poAssignments)), [poAssignments]);

    const [cancelledLoads, setCancelledLoads] = useState(() => {
        const saved = localStorage.getItem('sched_cancelledLoads');
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => localStorage.setItem('sched_cancelledLoads', JSON.stringify(cancelledLoads)), [cancelledLoads]);


    const calculations = useMemo(() => {
        const specsDef = bottleDefinitions[selectedSize];
        if (!specsDef) return null;

        // Inject name for UI/Export usage
        // Ensure palletsPerTruck is available (fallback for legacy data)
        const computedPallets = specsDef.palletsPerTruck || Math.ceil(specsDef.casesPerTruck / specsDef.casesPerPallet);
        const specs = { ...specsDef, name: selectedSize, palletsPerTruck: computedPallets };

        // Required Daily Loads = Target / Cases Per Truck
        // (Round up as per requirements "Round up to the nearest full truck")
        // Wait, requirement says "Required Daily Loads = Target Daily Production / Cases Per Truck (Round up)."
        const requiredDailyLoads = Math.ceil(targetDailyProduction / specs.casesPerTruck);

        const weeklyLoads = requiredDailyLoads * 7;

        // Schedule Distribution (3 Shifts)
        const shifts = [
            { name: 'Shift 1 (00:00-08:00)', loads: 0 },
            { name: 'Shift 2 (08:00-16:00)', loads: 0 },
            { name: 'Shift 3 (16:00-00:00)', loads: 0 },
        ];

        // Remove pre-calculation of even distribution
        // We will calculate exact distribution based on active trucks below

        // Hourly Logistics Logic
        // Burn Rate (Cases / Hour) assuming 24h ops
        const casesPerHour = targetDailyProduction / 24;
        const burnRate = casesPerHour; // aliases

        // Truck Interval
        // How many hours does one truck last?
        // Truck Capacity (Bottles) / Consumption (Bottles/hr)
        // OR Truck Capacity (Cases) / Consumption (Cases/hr)
        const truckCapacityCases = specs.casesPerTruck;
        const hoursPerTruck = casesPerHour > 0 ? truckCapacityCases / casesPerHour : 0;

        // Generate Detailed Schedule
        // Generate Detailed Schedule
        let truckSchedule = [];
        if (hoursPerTruck > 0 && requiredDailyLoads > 0) {
            const [startH, startM] = shiftStartTime.split(':').map(Number);
            let currentHour = startH + (startM / 60);

            for (let i = 0; i < requiredDailyLoads; i++) {
                const arrivalDecimal = currentHour + (hoursPerTruck * i);
                const normalizedDecimal = arrivalDecimal % 24;
                const h = Math.round(normalizedDecimal);
                const safeH = h === 24 ? 0 : h;
                const m = 0;
                const timeStr = `${safeH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                truckSchedule.push({
                    id: i + 1,
                    time: timeStr,
                    rawDecimal: normalizedDecimal,
                    po: poAssignments[String(i + 1)] || ''
                });
            }
        }

        // Filter Cancelled Loads
        const activeTrucks = truckSchedule.filter(t => !cancelledLoads.includes(String(t.id)));

        // Calculate Shift Distribution based on Active Trucks
        activeTrucks.forEach(truck => {
            const dec = truck.rawDecimal;
            if (dec >= 0 && dec < 8) shifts[0].loads++;
            else if (dec >= 8 && dec < 16) shifts[1].loads++;
            else shifts[2].loads++;
        });

        // Use filtered schedule for display
        truckSchedule = activeTrucks;

        // Risk Alert Logic
        // "If Safety Stock < Required Daily Loads"
        // Safety Stock is defined as "6 Loads" (safetyStockLoads from context)
        // Required Daily Loads is calculated above.
        const isHighRisk = safetyStockLoads < requiredDailyLoads;

        return {
            requiredDailyLoads,
            weeklyLoads,
            schedule: shifts,
            truckSchedule, // New detailed list
            burnRate,      // Cases/Hour
            hoursPerTruck, // Interval
            isHighRisk,
            safetyStockLoads, // For display in alert
            specs
        };

    }, [selectedSize, targetDailyProduction, shiftStartTime, bottleDefinitions, safetyStockLoads, poAssignments, cancelledLoads]);

    const updatePO = (id, value) => {
        setPoAssignments(prev => ({
            ...prev,
            [String(id)]: value
        }));
    };

    const toggleCancelled = (id) => {
        setCancelledLoads(prev => {
            const sid = String(id);
            if (prev.includes(sid)) {
                return prev.filter(item => item !== sid);
            }
            return [...prev, sid];
        });
    };

    return {
        formState: {
            selectedSize,
            targetDailyProduction,
            shiftStartTime,
            poAssignments
        },
        setters: {
            setSelectedSize,
            setTargetDailyProduction: (v) => setTargetDailyProduction(Number(v)),
            setShiftStartTime,
            updatePO,
            toggleCancelled
        },
        results: calculations
    };
}
