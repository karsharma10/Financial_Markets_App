import "./App.css";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                {/* define more routes here */}
            </Routes>
        </BrowserRouter>
    );
}
export default App;