import LockScreen from "./component/LockScreen";
import { Routes, Route } from "react-router-dom";
import { store } from "../src/store/store";
import { Provider } from "react-redux";
import HomeScreen from "./component/HomeScreen";

function App() {
  return (
    <div>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<LockScreen />} />
          <Route path="/home" element={<HomeScreen />} />
        </Routes>

        {/* <LockScreen /> */}
      </Provider>
    </div>
  );
}

export default App;
