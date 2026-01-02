import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Calendar,
  Target,
  BarChart,
  Settings,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const overlayVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 },
  };

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      to: "/timetable",
      label: "Timetable",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      to: "/goals",
      label: "Goals",
      icon: <Target className="h-5 w-5" />,
    },
    {
      to: "/analytics",
      label: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      to: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      <motion.div
        className="fixed inset-0 bg-black z-20 md:hidden"
        initial="closed"
        animate={open ? "open" : "closed"}
        variants={overlayVariants}
        transition={{ duration: 0.3 }}
        onClick={() => setOpen(false)}
        style={{ pointerEvents: open ? "auto" : "none" }}
      />

      {/* Sidebar */}
      <motion.nav
        className="fixed md:static top-0 left-0 bottom-0 h-screen w-64 bg-card z-30 border-r border-border flex flex-col"
        initial="closed"
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
        onClick={() => setOpen(false)}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        style={{ position: "fixed" }}
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center space-x-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-accent"
            >
              <path
                d="M12 8V12L14.5 14.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.6087 19C3.58041 19 2.0016 17.2091 2.0016 15C2.0016 13.1358 3.1232 11.5693 4.72195 11.1469C4.89261 8.32075 7.15425 6 9.99739 6C12.1229 6 13.9532 7.2926 14.8308 9.1206C15.0769 9.04211 15.3348 9 15.6016 9C17.2584 9 18.6016 10.3431 18.6016 12C18.6016 12.2321 18.5739 12.4562 18.5216 12.6693C19.827 13.2784 20.7516 14.5478 20.7516 16C20.7516 18.2091 18.9608 20 16.9325 20H5.6087Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-xl font-bold">
              <span className="text-accent">Time</span>
              <span>forge</span>
            </h1>
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-secondary"
                    }`
                  }
                  end
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </motion.nav>
    </>
  );
};

export default Sidebar;
