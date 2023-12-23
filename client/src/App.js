import "./App.css";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import NotFound from "./components/NotFound";
import CreateAccount from "./pages/CreateAccount";
import {BrowserRouter, Routes, Route} from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/*"} element={<NotFound/>}/>
                <Route path={"/"} element={<HomePage/>}/>
                <Route path={"/login"} element={<Login/>}/>
                <Route path={"/createAccount"} element={<CreateAccount/>}/>
                {/* define more routes here */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;