export default function RiskBanner({ isHighRisk, safetyStockLoads, requiredDailyLoads }) {
    if (!isHighRisk) return null;

    return (
        <div className="bg-red-600 text-white p-4 text-center font-bold text-lg animate-pulse">
            ⚠️ HIGH RISK: Safety Stock is under 24 Hours! (Burn Rate: {requiredDailyLoads} loads/day vs Safety: {safetyStockLoads} loads)
        </div>
    );
}
