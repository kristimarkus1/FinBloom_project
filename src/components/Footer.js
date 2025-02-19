import { useTheme } from "./ThemeContext";
import "../styles/Footer.css";

const Footer = () => {

    const { theme, toggleTheme } = useTheme();

    return (
        <footer className="footer">
            <div className="theme-toggle">
                <label className="switch">
                    <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"} />
                    <span className="slider"></span>
                </label>
                <span>{theme === "light" ? "Try out dark theme!" : "Try out light theme!"}</span>
            </div>
            
        </footer>
    );
};

export default Footer;
