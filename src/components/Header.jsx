import { Cog6ToothIcon } from '@heroicons/react/24/outline'; // Using text fallback if icons not installed, or assume standard heroicons usage if I install generic svg?
// Wait, I didn't install heroicons. I'll use simple text or unicode or svg directly.

export default function Header({ onOpenSettings }) {
    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    {/* Logo / Title */}
                    <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                        <span className="text-xl font-bold">L</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CoPal Scheduler</h1>
                </div>
                <button
                    onClick={onOpenSettings}
                    className="flex items-center text-gray-600 hover:text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
                >
                    <span className="mr-2">⚙️</span> Settings
                </button>
            </div>
        </header>
    );
}
