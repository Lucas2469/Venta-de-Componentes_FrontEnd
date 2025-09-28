import { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import ScheduleManager from "./ScheduleManager";


interface UserMenuProps {
  vendedorId: number; // id del vendedor autenticado
  onSignOut?: () => void;
}

export default function UserMenu({ vendedorId, onSignOut }: UserMenuProps) {
  const [openSchedules, setOpenSchedules] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSchedulesClick = () => {
    setOpenSchedules(true);
    setIsOpen(false);
  };

  const handleSignOutClick = () => {
    setIsOpen(false);
    onSignOut?.();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Menú de usuario</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Mi cuenta</p>
              </div>

              <button
                onClick={handleSchedulesClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
              >
                Mis horarios
              </button>

              <button
                onClick={handleSignOutClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      <ScheduleManager
        open={openSchedules}
        onOpenChange={setOpenSchedules}
        vendedorId={vendedorId}
      />
    </>
  );
}