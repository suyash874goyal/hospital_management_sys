import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:8000/api";

export default function App() {
    const [view, setView] = useState("login");
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [appointmentData, setAppointmentData] = useState({
        date: "",
        reason: "",
    });

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (view === "dashboard" && token) {
            fetchAppointments();
        }
    }, [view, token]);

    async function fetchAppointments() {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/appointments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch appointments");
            const data = await res.json();
            setAppointments(data);
        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed");
            setMessage("Registered successfully. Please login.");
            setRegisterData({ name: "", email: "", password: "" });
            setView("login");
        } catch (err) {
            setMessage(err.message);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setLoginData({ email: "", password: "" });
            setView("dashboard");
        } catch (err) {
            setMessage(err.message);
        }
    }

    function handleLogout() {
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setView("login");
        setAppointments([]);
        setMessage("");
    }

    async function handleBookAppointment(e) {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    date: appointmentData.date,
                    reason: appointmentData.reason,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Booking failed");
            setMessage("Appointment booked!");
            setAppointmentData({ date: "", reason: "" });
            fetchAppointments();
        } catch (err) {
            setMessage(err.message);
        }
    }

    async function cancelAppointment(id) {
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/appointments/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Cancel failed");
            setMessage("Appointment cancelled.");
            fetchAppointments();
        } catch (err) {
            setMessage(err.message);
        }
    }

    return ( <
        div className = "app-container" >
        <
        h1 > Hospital Management < /h1>

        {
            message && < div className = "message" > { message } < /div>}

            {
                view === "login" && ( <
                    form className = "form"
                    onSubmit = { handleLogin } >
                    <
                    h2 > Login < /h2> <
                    input type = "email"
                    placeholder = "Email"
                    value = { loginData.email }
                    onChange = {
                        (e) =>
                        setLoginData({...loginData, email: e.target.value })
                    }
                    required /
                    >
                    <
                    input type = "password"
                    placeholder = "Password"
                    value = { loginData.password }
                    onChange = {
                        (e) =>
                        setLoginData({...loginData, password: e.target.value })
                    }
                    required /
                    >
                    <
                    button type = "submit" > Login < /button> <
                    p >
                    Dont have an Account ? { " " } <
                    span className = "link"
                    onClick = {
                        () => setView("register") } >
                    Register here <
                    /span> <
                    /p> <
                    /form>
                )
            }

            {
                view === "register" && ( <
                    form className = "form"
                    onSubmit = { handleRegister } >
                    <
                    h2 > Register < /h2> <
                    input type = "text"
                    placeholder = "Name"
                    value = { registerData.name }
                    onChange = {
                        (e) =>
                        setRegisterData({...registerData, name: e.target.value })
                    }
                    required /
                    >
                    <
                    input type = "email"
                    placeholder = "Email"
                    value = { registerData.email }
                    onChange = {
                        (e) =>
                        setRegisterData({...registerData, email: e.target.value })
                    }
                    required /
                    >
                    <
                    input type = "password"
                    placeholder = "Password"
                    value = { registerData.password }
                    onChange = {
                        (e) =>
                        setRegisterData({...registerData, password: e.target.value })
                    }
                    required /
                    >
                    <
                    button type = "submit" > Register < /button> <
                    p >
                    Already have an account ? { " " } <
                    span className = "link"
                    onClick = {
                        () => setView("login") } >
                    Login here <
                    /span> <
                    /p> <
                    /form>
                )
            }

            {
                view === "dashboard" && user && ( <
                    div className = "dashboard" >
                    <
                    div className = "dashboard-header" >
                    <
                    h2 > Welcome, { user.name } < /h2> <
                    button onClick = { handleLogout } > Logout < /button> <
                    /div>

                    <
                    form className = "form appointment-form"
                    onSubmit = { handleBookAppointment } >
                    <
                    h3 > Book Appointment < /h3> <
                    input type = "datetime-local"
                    value = { appointmentData.date }
                    onChange = {
                        (e) =>
                        setAppointmentData({...appointmentData, date: e.target.value })
                    }
                    required /
                    >
                    <
                    input type = "text"
                    placeholder = "Reason"
                    value = { appointmentData.reason }
                    onChange = {
                        (e) =>
                        setAppointmentData({...appointmentData, reason: e.target.value })
                    }
                    required /
                    >
                    <
                    button type = "submit" > Book < /button> <
                    /form>

                    <
                    h3 > Your Appointments < /h3> {
                        loading ? ( <
                            p > Loading appointments... < /p>
                        ) : appointments.length === 0 ? ( <
                            p > No appointments booked. < /p>
                        ) : ( <
                            ul className = "appointments-list" > {
                                appointments.map((app) => ( <
                                    li key = { app._id }
                                    className = { `appointment ${app.status}` } >
                                    <
                                    div >
                                    <
                                    strong > Date: < /strong> {new Date(app.date).toLocaleString()} <
                                    /div> <
                                    div >
                                    <
                                    strong > Reason: < /strong> {app.reason} <
                                    /div> <
                                    div >
                                    <
                                    strong > Status: < /strong> {app.status} <
                                    /div> {
                                        app.status === "booked" && ( <
                                            button className = "cancel-btn"
                                            onClick = {
                                                () => cancelAppointment(app._id) } >
                                            Cancel <
                                            /button>
                                        )
                                    } <
                                    /li>
                                ))
                            } <
                            /ul>
                        )
                    } <
                    /div>
                )
            } <
            /div>
        );
    }