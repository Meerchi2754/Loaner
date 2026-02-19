import LockScreen from "./component/LockScreen";
import { Routes, Route } from "react-router-dom";
import { store } from "../src/store/store";
import { Provider } from "react-redux";
import HomeScreen from "./pages/HomeScreen";
import { useEffect } from "react";
import { seedDatabase } from "./db/seed";
import { ToastContainer } from "react-toastify";
import AddTransaction from "./pages/AddTransaction";
import HistoryTransaction from "./component/HistoryTransaction";
import BottomNav from "./component/BottomNav";
import TranscationPage from "./pages/TransactionHistory"

function App() {
  useEffect(() => {
    seedDatabase();
  }, []);
  return (
    <div>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<LockScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/addtransaction" element={<AddTransaction />} />
          <Route path="/history" element={<HistoryTransaction />} />
          <Route path="/transactionspath" element={<TranscationPage />} />
          
          {/* <Route path="/bottom" element={<BottomNav />} /> */}
        </Routes>
          <BottomNav />
        <ToastContainer />
        {/* <LockScreen /> */}
      </Provider>
    </div>
  );
}

export default App;
