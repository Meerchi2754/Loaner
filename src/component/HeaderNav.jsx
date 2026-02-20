import { useNavigate } from "react-router-dom";
const Navbar = ({ totalBalance = 0, profileImage = null }) => {
  const navigate = useNavigate();
  return (
    <div className=" backdrop-blur-md bg-[#121212]/70 fixed top-0 left-0 right-0  text-white px-4 py-3 flex items-center justify-between shadow-lg z-10">
      {/* Left: App Icon */}
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-lg font-bold"
          onClick={() => navigate("/settings")}
        >
          K
        </div>
        <span className="text-sm font-semibold hidden sm:inline">Karazdar</span>
      </div>

      {/* Center: Total Balance */}
      <div className="text-center">
        <p className="text-xs text-gray-400">Total Balance</p>
        <p className="text-2xl font-bold">
          ₹{totalBalance?.toFixed(2) || "0.00"}
        </p>
      </div>

      {/* Right: Profile Image */}
      <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="text-lg font-bold text-gray-300"
            onClick={() => navigate("/settings")}
          >
            U
          </span>
        )}
      </div>
    </div>
  );
};

export default Navbar;
