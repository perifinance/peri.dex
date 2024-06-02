import { set } from "date-fns";
import { tr } from "date-fns/locale";
import { formatNumber } from "lib";
import React, { useEffect, useRef, useState } from "react";
// import "./AnimatedText.css"; // Make sure to import your Tailwind CSS styles

type AnimatedTextProps = {
    value?: number;
    tailWinStyle?: string;
    precision?: number;
    id?: string;
};

const AnimatedText: React.FC<AnimatedTextProps> = ({ value = 0, tailWinStyle = "", precision = 8, id }) => {
    const [text, setText] = useState("0");
    const [nValue, setNValue] = useState(0);
    const [twProps, setTwProps] = useState("text-gray-300");
    const spanRef = useRef(null);
    const periodRef = useRef(null);
    const [divWidth, setDivWidth] = useState(0);
    const [spanHeight, setSpanHeight] = useState(0);
    const [spanWidths, setSpanWidths] = useState([]);


    useEffect(() => {
        // if (!text || !displayedText) return;
        const text = formatNumber(value, precision);
        const newValue = Number(text.replaceAll(/,/g, ""));

        let totalWidth = 1;
        // const spanWidths = [];
        const spanWidths = text.split("").map((char, index) => {
            const width = [".", ","].includes(char) ? periodRef.current.offsetWidth : spanRef.current.offsetWidth;
            totalWidth += width;
            return width;
        });

        const twProps =
            `${nValue !== 0 && nValue !== newValue
                ? nValue < newValue
                    ? "text-blue-500"
                    : "text-red-400"
                : "text-gray-300"} `;

        setNValue(newValue);
        setTwProps(twProps);
        setText(text);
        setSpanWidths(spanWidths);
        setSpanHeight(spanRef.current.offsetHeight);
        setDivWidth(Math.ceil(totalWidth));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    let cumulativeWidth = 0;
    const num = ['0','1','2','3','4','5','6','7','8','9','.',',']
    return (
        <div className="flex w-full justify-center ">
            <div 
                className={`overflow-hidden relative flex ${tailWinStyle} ${twProps}`}
                style={{ width: `${divWidth}px` }} 
            >
                <span ref={spanRef} className="invisible">
                    9
                </span>
                <span ref={periodRef} className="invisible">
                    .
                </span>
                {text.split("").map((char, index) => {
                    const leftPosition = index === 0 ? 0 : cumulativeWidth;
                    cumulativeWidth = index === 0 ? spanWidths[index] : cumulativeWidth + spanWidths[index];

                    return (
                        <div 
                            id={id ? id : "anmt-div"}
                            key={index} 
                            className={`flex flex-col absolute transition-transform duration-150`}
                            style={{ left: `${leftPosition}px`, width: `${spanWidths[index]}px`, transform: `translateY(-${spanHeight*num.indexOf(char)}px)`}}
                        >
                            {num.map((n, i) => (
                                <span
                                    id={id ? id : "anmt"}
                                    key={i}
                                    className={`text-center`}
                                >
                                    {n}
                                </span>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnimatedText;
