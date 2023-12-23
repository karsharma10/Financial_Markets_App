import axios from "axios";

export const config = {
    LOGIN_USER_ENDPOINT: "/login-user",
    ADD_USER_ENDPOINT: "/add-user",
};

export default axios.create({baseURL: "http://localhost:8080"});