import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FinBloomLightLogo from "../assets/FinBloom_Light_Logo_Text_PNG.PNG";
import FinBloomDarkLogo from "../assets/FinBloom_Dark_Logo_Text_PNG.PNG";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useTheme } from "./ThemeContext"; 
import "../App.css";

const Login = () => {
    const { theme } = useTheme(); 
    const [nickname, setNickname] = useState(""); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (password !== confirmPassword) {
                    alert("Passwords do not match!");
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, { displayName: nickname });

                await setDoc(doc(db, "users", user.uid), {
                    nickname: nickname,
                    email: email,
                    createdAt: new Date(),
                });

                await setDoc(doc(db, "users", user.uid, "income", "default"), {
                name: "Default Income",
                category: "",
                expected: 0,
                actual: 0,
                });

                await setDoc(doc(db, "users", user.uid, "fixedExpenses", "default"), {
                name: "Default Fixed Expense",
                category: "",
                expected: 0,
                actual: 0,
                });

                await setDoc(doc(db, "users", user.uid, "nonFixedExpenses", "default"), {
                name: "Default Non-Fixed Expense",
                category: "",
                expected: 0,
                actual: 0,
                });
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("Authentication Error:", error.message);
            alert(error.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <img src={theme === "dark" ? FinBloomDarkLogo : FinBloomLightLogo} alt="FinBloom Logo" className="loginLogo" />
                <h2>{isLogin ? "Welcome to FinBloom!" : "Create an Account"}</h2>
                <p>{isLogin ? "Log in to start tracking your budget." : "Sign up to start managing your finances!"}</p>
                <form onSubmit={handleAuth}>
                    {!isLogin && (
                        <input 
                            type="text" 
                            placeholder="Nickname" 
                            value={nickname} 
                            onChange={(e) => setNickname(e.target.value)} 
                            className="login-inputs"
                            required 
                        />
                    )}
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-inputs" 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-inputs" 
                        required 
                    />
                    {!isLogin && (
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="login-inputs"
                            required 
                        />
                    )}
                    <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
                </form>
                <p onClick={() => setIsLogin(!isLogin)} className="switch-auth">
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                </p>
            </div>
        </div>
    );
};

export default Login;