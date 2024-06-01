import { formatNumber } from "lib";
import React, { useEffect, useRef, useState } from "react";
// import "./AnimatedText.css"; // Make sure to import your Tailwind CSS styles

type AnimatedTextProps = {
    value?: number;
    tailWinStyle?: string;
    precision?: number;
    id?: string;
};
const getRandomDirection = () => (Math.random() > 0.5 ? "up" : "down");

const AnimatedText: React.FC<AnimatedTextProps> = ({ value = 0, tailWinStyle = "", precision = 8, id }) => {
    const [displayedText, setDisplayedText] = useState("0");
    const [text, setText] = useState("0");
    const [nValue, setNValue] = useState(0);
    const [twProps, setTwProps] = useState("text-gray-300");
    const [animations, setAnimations] = useState([]);
    const spanRef = useRef(null);
    const periodRef = useRef(null);
    const [charWidth, setCharWidth] = useState(0);
    const [periodWidth, setPeriodWidth] = useState(0);

    const animatedElementRef = useRef(null);

    useEffect(() => {
        const animatedElement = animatedElementRef.current;
        if (animatedElement) {
            const handleAnimationEnd = () => {
                setAnimations([]);
            	setDisplayedText(text);
            };
            animatedElement.addEventListener("animationend", handleAnimationEnd);

            return () => {
                animatedElement.removeEventListener("animationend", handleAnimationEnd);
            };
        }
    }, []);

    useEffect(() => {
        // if (!text || !displayedText) return;
        const text = formatNumber(value, precision);
        const newValue = Number(text.replaceAll(/,/g, ""));
        const twProps =
            nValue !== 0 && nValue !== newValue
                ? nValue < newValue
                    ? "text-blue-500"
                    : "text-red-400"
                : "text-gray-300";

        const newAnimations = text.split("").map((char, index) => {
            return char !== displayedText[index] ? (char > displayedText[index] ? "up" : "down") : "";
        });

        const timeout = setTimeout(() => {
			setAnimations([]);
        }, 100); // Animation duration
		const timeout2 = setTimeout(() => {
            setDisplayedText(text);
        }, 200); // Animation duration

        setNValue(newValue);
        setTwProps(twProps);
        setAnimations(newAnimations);
        setText(text);

        return () => {
			clearTimeout(timeout);
			clearTimeout(timeout2);
		}
    }, [value]);

    useEffect(() => {
        if (spanRef.current) {
            setCharWidth(spanRef.current.offsetWidth * 1.05);
            // spanRef.current.classList.add("hidden");
        }
        if (periodRef.current) {
            setPeriodWidth(periodRef.current.offsetWidth);
            // periodRef.current.classList.add("hidden");
        }
    }, [twProps]);

    let cumulativeWidth = 0;
    return (
        <div className={`overflow-hidden relative mx-auto flex justify-end ${tailWinStyle} ${twProps}`}>
            <span ref={spanRef} className="invisible">
                9
            </span>
            <span ref={periodRef} className="invisible">
                .
            </span>
            {displayedText.split("").map((char, index) => {
                const charWidthToUse = [".", ","].includes(char) ? periodWidth : charWidth;
                const leftPosition = cumulativeWidth;
                cumulativeWidth += charWidthToUse;

                return (
                    <span
						// ref={animatedElementRef}
                        id={id ? id : "anmt"}
                        key={`old-${index}`}
                        className={`text-center transition-transform duration-200 ${
                            animations[index] === "up"
                                ? "absolute animate-move-up"
                                : animations[index] === "down"
                                ? "absolute animate-move-dn"
                                : "hidden"
                        }`}
                        style={{ left: `${leftPosition}px`, width: `${charWidthToUse}px` }}
                    >
                        {char}
                    </span>
                );
            })}
            {text.split("").map((char, index) => {
                const charWidthToUse = [".", ","].includes(char) ? periodWidth : charWidth;
                const leftPosition = index === 0 ? 0 : cumulativeWidth;
                cumulativeWidth = index === 0 ? charWidthToUse : cumulativeWidth + charWidthToUse;

                return (
                    <span
                        id={id ? id : "anmt"}
                        key={index}
                        className={`absolute text-center transition-transform duration-200 ${
                            animations[index] === "up"
                                ? "animate-fade-up"
                                : animations[index] === "down"
                                ? "animate-fade-dn"
                                : ""
                        }`}
                        style={{ left: `${leftPosition}px`, width: `${charWidthToUse}px` }}
                    >
                        {char}
                    </span>
                );
            })}
        </div>
    );
};

export default AnimatedText;
