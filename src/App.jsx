import { useState, useEffect, useRef, useCallback } from "react";

const BALL_COLORS = {
    B: { bg: "#4FC3F7", letter: "#0277BD", shadow: "#01579B" },
    I: { bg: "#EF5350", letter: "#B71C1C", shadow: "#7F0000" },
    N: { bg: "#BDBDBD", letter: "#424242", shadow: "#212121" },
    G: { bg: "#66BB6A", letter: "#1B5E20", shadow: "#0a3d0a" },
    O: { bg: "#FFA726", letter: "#E65100", shadow: "#7f2e00" },
};

const LETTER_RANGES = { B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75] };

function randomBetween(a, b) {
    return a + Math.random() * (b - a);
}

function createBall(id, width, height) {
    const letters = Object.keys(LETTER_RANGES);
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const [min, max] = LETTER_RANGES[letter];
    const number = Math.floor(randomBetween(min, max + 1));
    const radius = randomBetween(32, 48);
    return {
        id,
        letter,
        number,
        radius,
        x: randomBetween(radius, width - radius),
        y: randomBetween(radius, height - radius),
        vx: randomBetween(-2.5, 2.5) || 1.5,
        vy: randomBetween(-2.5, 2.5) || 1.5,
        rotation: Math.random() * 360,
        rotationSpeed: randomBetween(-1.5, 1.5),
    };
}

function useBalls(count) {
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const ballsRef = useRef([]);
    const [balls, setBalls] = useState([]);
    const animFrameRef = useRef(null);
    const dimRef = useRef(dimensions);

    useEffect(() => {
        const handleResize = () => {
            const d = { width: window.innerWidth, height: window.innerHeight };
            setDimensions(d);
            dimRef.current = d;
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const { width, height } = dimRef.current;
        ballsRef.current = Array.from({ length: count }, (_, i) => createBall(i, width, height));
        setBalls(ballsRef.current.map((b) => ({...b })));
    }, [count]);

    useEffect(() => {
        const animate = () => {
            const { width, height } = dimRef.current;
            ballsRef.current = ballsRef.current.map((b) => {
                let { x, y, vx, vy, radius, rotation, rotationSpeed } = b;
                x += vx;
                y += vy;
                if (x - radius <= 0) { x = radius;
                    vx = Math.abs(vx); }
                if (x + radius >= width) { x = width - radius;
                    vx = -Math.abs(vx); }
                if (y - radius <= 0) { y = radius;
                    vy = Math.abs(vy); }
                if (y + radius >= height) { y = height - radius;
                    vy = -Math.abs(vy); }
                rotation += rotationSpeed;
                return {...b, x, y, vx, vy, rotation };
            });
            setBalls(ballsRef.current.map((b) => ({...b })));
            animFrameRef.current = requestAnimationFrame(animate);
        };
        animFrameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, []);

    return balls;
}

function BingoBall({ ball }) {
    const { letter, number, radius, x, y, rotation } = ball;
    const colors = BALL_COLORS[letter];
    const size = radius * 2;
    const fontSize = radius * 0.62;
    const letterSize = radius * 0.38;

    return ( <
        div style = {
            {
                position: "absolute",
                left: x - radius,
                top: y - radius,
                width: size,
                height: size,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, #fff8, ${colors.bg} 55%, ${colors.shadow})`,
                boxShadow: `0 6px 20px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.35)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotate(${rotation}deg)`,
                userSelect: "none",
                cursor: "default",
                willChange: "transform, left, top",
            }
        } >
        { /* Inner stripe band */ } <
        div style = {
            {
                position: "absolute",
                width: "70%",
                height: "28%",
                background: "rgba(255,255,255,0.92)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }
        } >
        <
        span style = {
            {
                fontSize: fontSize,
                fontWeight: 900,
                color: colors.letter,
                fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                lineHeight: 1,
                letterSpacing: "-1px",
            }
        } > { number } < /span> <
        /div> { /* Letter top */ } <
        span style = {
            {
                position: "absolute",
                top: "12%",
                fontSize: letterSize,
                fontWeight: 900,
                color: "rgba(255,255,255,0.9)",
                fontFamily: "'Fredoka One', 'Nunito', sans-serif",
                textShadow: `0 1px 3px ${colors.shadow}`,
            }
        } > { letter } < /span> <
        /div>
    );
}

const MENU_ITEMS = ["GENERATE", "PATTERN", "CHECKER", "ANALYZER", "GALLERY"];

export default function BingoFortune() {
    const balls = useBalls(30);
    const [activeMenu, setActiveMenu] = useState(null);
    const [sparkle, setSparkle] = useState(false);

    const handleLogoClick = () => {
        setSparkle(true);
        setTimeout(() => setSparkle(false), 600);
    };

    return ( <
            div style = {
                {
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                    position: "relative",
                    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 60%, #38b2f0 100%)",
                    fontFamily: "'Fredoka One', 'Nunito', cursive",
                }
            } > { /* Ambient gradient overlay */ } <
            div style = {
                {
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.07) 0%, transparent 70%)",
                }
            }
            />

            { /* Bouncing Balls */ } {
                balls.map((ball) => < BingoBall key = { ball.id }
                    ball = { ball }
                    />)}

                    { /* Center UI */ } <
                    div style = {
                        {
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0,
                            zIndex: 10,
                        }
                    } > { /* Lucky clover icon */ } <
                    div onClick = { handleLogoClick }
                    style = {
                        {
                            width: 70,
                            height: 70,
                            borderRadius: "50%",
                            background: "#111",
                            border: "3px solid #222",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 34,
                            cursor: "pointer",
                            marginBottom: 6,
                            boxShadow: sparkle ?
                                "0 0 0 8px rgba(102,187,106,0.5), 0 0 40px rgba(102,187,106,0.7)" :
                                "0 4px 24px rgba(0,0,0,0.5)",
                            transition: "box-shadow 0.2s",
                            userSelect: "none",
                        }
                    } >
                    🍀
                    <
                    /div>

                    { /* Title */ } <
                    h1 style = {
                        {
                            fontSize: "clamp(2rem, 5vw, 3.2rem)",
                            fontWeight: 900,
                            color: "#fff",
                            letterSpacing: 3,
                            textShadow: "0 4px 24px rgba(0,0,0,0.4), 0 2px 0 rgba(0,0,0,0.3)",
                            margin: "4px 0 18px",
                            textAlign: "center",
                            fontFamily: "'Fredoka One', sans-serif",
                        }
                    } >
                    BINGO FORTUNE <
                    /h1>

                    { /* Menu */ } <
                    div style = {
                        { display: "flex", flexDirection: "column", gap: 10, width: "min(320px, 80vw)" } } > {
                        MENU_ITEMS.map((item) => ( <
                            button key = { item }
                            onClick = {
                                () => setActiveMenu(activeMenu === item ? null : item) }
                            style = {
                                {
                                    background: activeMenu === item ?
                                        "linear-gradient(90deg, #4CAF50, #2196F3)" :
                                        "rgba(30,30,30,0.82)",
                                    color: "#fff",
                                    border: activeMenu === item ? "2px solid #66BB6A" : "2px solid transparent",
                                    borderRadius: 12,
                                    padding: "14px 0",
                                    fontSize: "1.1rem",
                                    fontWeight: 800,
                                    fontFamily: "'Fredoka One', sans-serif",
                                    letterSpacing: 3,
                                    cursor: "pointer",
                                    width: "100%",
                                    backdropFilter: "blur(10px)",
                                    boxShadow: activeMenu === item ?
                                        "0 0 20px rgba(102,187,106,0.4), 0 4px 16px rgba(0,0,0,0.3)" :
                                        "0 4px 16px rgba(0,0,0,0.3)",
                                    transition: "all 0.18s cubic-bezier(.4,2,.6,1)",
                                    transform: activeMenu === item ? "scale(1.04)" : "scale(1)",
                                }
                            }
                            onMouseEnter = {
                                e => {
                                    if (activeMenu !== item) {
                                        e.currentTarget.style.background = "rgba(60,60,70,0.95)";
                                        e.currentTarget.style.transform = "scale(1.03)";
                                    }
                                }
                            }
                            onMouseLeave = {
                                e => {
                                    if (activeMenu !== item) {
                                        e.currentTarget.style.background = "rgba(30,30,30,0.82)";
                                        e.currentTarget.style.transform = "scale(1)";
                                    }
                                }
                            } >
                            { item } <
                            /button>
                        ))
                    } <
                    /div>

                    { /* Sub-panel for active item */ } {
                        activeMenu && ( <
                            div style = {
                                {
                                    marginTop: 14,
                                    background: "rgba(10,10,20,0.85)",
                                    borderRadius: 14,
                                    padding: "18px 28px",
                                    color: "#fff",
                                    width: "min(320px, 80vw)",
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    textAlign: "center",
                                    fontFamily: "'Nunito', sans-serif",
                                    fontSize: "0.97rem",
                                    lineHeight: 1.6,
                                    animation: "fadeSlideIn 0.22s ease",
                                }
                            } > { activeMenu === "GENERATE" && "🎲 Generate a fresh Bingo card with random numbers across all columns!" } { activeMenu === "PATTERN" && "🔲 Choose a winning pattern: Line, Diagonal, Blackout, L-Shape, and more!" } { activeMenu === "CHECKER" && "✅ Mark your called numbers and auto-check if you've hit Bingo!" } { activeMenu === "ANALYZER" && "📊 Analyze your card's probability and hot/cold number statistics." } { activeMenu === "GALLERY" && "🖼️ Browse and save your favourite Bingo card designs and patterns." } <
                            /div>
                        )
                    } <
                    /div>

                    { /* Font import & keyframe */ } <
                    style > { `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` } < /style> <
                    /div>
                );
            }