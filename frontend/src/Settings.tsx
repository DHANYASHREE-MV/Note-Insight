
import { useTheme, type Theme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { getTranslation } from "./translations";

import "./Settings.css";

function Settings() {
    /* =====================================================
       THEME
    ====================================================== */

    const { theme, setTheme } = useTheme();


    /* =====================================================
       LANGUAGE
    ====================================================== */

    const { language, setLanguage } = useLanguage();

    const t = getTranslation(language);


    /* =====================================================
       THEME OPTIONS
    ====================================================== */

    const themeOptions: {
        value: Theme;
        label: string;
        icon: string;
        description: string;
    }[] = [
        {
            value: "light",
            label: t.light,
            icon: "☀️",
            description: t.lightDescription,
        },

        {
            value: "dark",
            label: t.dark,
            icon: "🌙",
            description: t.darkDescription,
        },

        {
            value: "system",
            label: t.system,
            icon: "💻",
            description: t.systemDescription,
        },
    ];


    /* =====================================================
       PAGE
    ====================================================== */

    return (
        <div className="settings-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="settings-sidebar">


                {/* BRAND */}

                <div className="settings-brand">

                    <div className="settings-logo">
                        NI
                    </div>

                    <div>

                        <strong>
                            NOTE INSIGHT
                        </strong>

                        <small>
                            Clinical AI
                        </small>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="settings-nav">


                    {/* DASHBOARD */}

                    <button
                        type="button"
                        onClick={() => {
                            window.location.href =
                                "/dashboard";
                        }}
                    >
                        <span>⌂</span>

                        {t.dashboard}

                    </button>


                    {/* NEW ANALYSIS */}

                    <button
                        type="button"
                        onClick={() => {
                            window.location.href =
                                "/new-analysis";
                        }}
                    >
                        <span>＋</span>

                        {t.newAnalysis}

                    </button>


                    {/* SETTINGS */}

                    <button
                        type="button"
                        className="settings-nav-active"
                    >
                        <span>⚙</span>

                        {t.settings}

                    </button>

                </nav>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="settings-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="settings-header">

                    <div>

                        <p className="settings-eyebrow">
                            {t.preferences}
                        </p>

                        <h1>
                            {t.settingsTitle}
                        </h1>

                        <p>
                            {t.customize}
                        </p>

                    </div>

                </header>


                {/* =================================================
                    APPEARANCE
                ================================================= */}

                <section className="settings-card">


                    <div className="settings-card-header">

                        <div className="settings-section-icon">
                            🎨
                        </div>

                        <div>

                            <h2>
                                {t.appearance}
                            </h2>

                            <p>
                                {t.appearanceDescription}
                            </p>

                        </div>

                    </div>


                    {/* THEME OPTIONS */}

                    <div className="theme-options">

                        {themeOptions.map((option) => (

                            <button
                                key={option.value}
                                type="button"
                                className={`theme-option ${
                                    theme === option.value
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    setTheme(option.value)
                                }
                            >

                                <div className="theme-icon">
                                    {option.icon}
                                </div>


                                <div className="theme-option-text">

                                    <strong>
                                        {option.label}
                                    </strong>

                                    <span>
                                        {option.description}
                                    </span>

                                </div>


                                <div className="theme-radio">

                                    {theme === option.value &&
                                        "✓"}

                                </div>

                            </button>

                        ))}

                    </div>

                </section>


            

                <section className="settings-card">


                    <div className="settings-card-header">

                        <div className="settings-section-icon">
                            🌐
                        </div>

                        <div>

                            <h2>
                                {t.language}
                            </h2>

                            <p>
                                {t.languageDescription}
                            </p>

                        </div>

                    </div>


                    {/* LANGUAGE SELECT */}

                    <select
                        className="language-select"

                        value={language}

                        onChange={(event) =>
                            setLanguage(
                                event.target.value as
                                    "en" |
                                    "kn" |
                                    "hi"
                            )
                        }
                    >

                        <option value="en">
                            English
                        </option>

                        <option value="kn">
                            ಕನ್ನಡ (Kannada)
                        </option>

                        <option value="hi">
                            हिन्दी (Hindi)
                        </option>

                    </select>

                </section>


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <section className="settings-card">

                    <div className="settings-row">


                        {/* ICON */}

                        <div className="settings-row-icon">
                            🔔
                        </div>


                        {/* CONTENT */}

                        <div className="settings-row-content">

                            <h2>
                                {t.notifications}
                            </h2>

                            <p>
                                {t.notificationsDescription}
                            </p>

                        </div>


                        {/* TOGGLE */}

                        <label className="toggle">

                            <input
                                type="checkbox"
                                defaultChecked
                            />

                            <span />

                        </label>

                    </div>

                </section>

            </main>

        </div>
    );
}


export default Settings;
