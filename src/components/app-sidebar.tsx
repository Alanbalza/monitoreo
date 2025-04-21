import * as React from "react";
import {
  Frame,
  PieChart,
  Home,
  Menu,
  LayoutGrid,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Importa el TeamSwitcher modificado con la funcionalidad de tema
import { TeamSwitcher } from "@/components/team-switcher";
import { NavProjects } from "@/components/nav-projects";
import { Button } from "@/components/ui/button";

// Esta es una muestra de datos
const data = {
  teams: [
    {
      name: "Monitoreo UP",
      logo: Frame,
      plan: "Universidad",
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/",
      icon: PieChart,
    },
    {
      name: "Reporte",
      url: "/reporte",
      icon: FileText,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Header móvil */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Monitoreo de sensores UP</span>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        collapsible="icon"
        className={`fixed inset-y-0 left-0 z-50 transform border-r bg-background transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:w-64`}
        {...props}
      >
        <SidebarHeader className="border-b px-4 py-2">
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <NavProjects projects={data.projects} />
        </SidebarContent>
      </Sidebar>

      {/* Barra de navegación inferior para móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
        <div className="flex h-16 items-center justify-around">
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Inicio</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs">Pestañas</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center gap-1"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs">Menú</span>
          </Button>
        </div>
      </div>

      {/* Overlay para cerrar el sidebar en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
