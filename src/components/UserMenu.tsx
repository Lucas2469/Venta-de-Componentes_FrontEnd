import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "../components/ui/button";
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import ScheduleManager from "./ScheduleManager";


interface UserMenuProps {
vendedorId: number; // id del vendedor autenticado
onSignOut?: () => void;
}


export default function UserMenu({ vendedorId, onSignOut }: UserMenuProps) {
const [openSchedules, setOpenSchedules] = useState(false);


return (
<>
<DropdownMenu>
<DropdownMenuTrigger asChild>
<Button variant="ghost" size="icon" className="relative">
<User className="h-5 w-5" />
<span className="sr-only">Menú de usuario</span>
</Button>
</DropdownMenuTrigger>
<DropdownMenuContent align="end" className="w-48">
<DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
<DropdownMenuSeparator />
<DropdownMenuItem onClick={() => setOpenSchedules(true)}>
Mis horarios
</DropdownMenuItem>
<DropdownMenuItem onClick={onSignOut}>Cerrar sesión</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>


<ScheduleManager
open={openSchedules}
onOpenChange={setOpenSchedules}
vendedorId={vendedorId}
/>
</>
);
}