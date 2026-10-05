import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const getLinkClass = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo">
        <h2>✈ AeroSim</h2>
        <span>EAD Flight System</span>
      </div>

      {/* Navigation */}
      <nav>
        <NavLink to="/" end className={getLinkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/aircraft" className={getLinkClass}>
          Aircraft
        </NavLink>

        <NavLink to="/flights" className={getLinkClass}>
          Flights
        </NavLink>

        <NavLink to="/" end className={getLinkClass}>
          Simulator
        </NavLink>

        <NavLink to="/telemetry" className={getLinkClass}>
          Telemetry
        </NavLink>

        <NavLink to="/history" className={getLinkClass}>
          Flight Reports
        </NavLink>

        {/* Future modules */}
        <NavLink to="/maintenance" className={getLinkClass}>
  Maintenance
</NavLink>

<NavLink to="/iot-devices" className={getLinkClass}>
  IoT Devices
</NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <small>FlightSimulation Team</small>
      </div>
    </aside>
  );
};

export default Sidebar;