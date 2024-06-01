import React, { useEffect, useState } from "react";
import "css/RangeInput.css";

type RangeInputProps = {
    per: BigInt;
    setPerAmount: Function;
    divide?: number;
    canInput?: boolean;
    bgColor?: string;
    color?: string;
};

function RangeInput({
    per,
    setPerAmount,
    divide = 4,
    canInput = false,
    bgColor = "bg-cyan-450",
    color = "text-cyan-450",
}: RangeInputProps) {
    const [levels, setLevels] = useState([]);

    useEffect(() => {
        const levels = [];
        for (let i = 0; i <= divide; i++) {
            const level = Math.floor((i * 100) / divide);
            levels.push(level > 100 ? 100 : level);
        }
        setLevels(levels);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div className="flex flex-col my-2 items-center">
            <div className="flex flex-row w-full items-center justify-between">
                <div className={`flex flex-row items-center justify-between text-blue-200 w-full `}>
                    <input
                        className={`cursor-pointer w-full mr-1 rounded-md h-2 ${bgColor} `}
                        type="range"
                        min="0"
                        max="100"
                        value={per.toString()}
                        onChange={(e) => setPerAmount(BigInt(e.target.value))}
                    />
                </div>
                {canInput && (
                    <div className="flex items-center h-7 border-[0.2px] border-blue-750 rounded-md text-sm ml-1 pr-1 bg-blue-950 ">
                        <input
                            className="w-7 outline-none bg-inherit text-right mr-[2px]"
                            type="number"
                            max="100"
                            value={per.toString()}
                            onChange={(e) =>
                                setPerAmount(Number(e.target.value) > 100 ? BigInt("100") : BigInt(e.target.value))
                            }
                        />
                        <p className="text-[10px]">%</p>
                    </div>
                )}
            </div>
            <div className="flex justify-between mt-1 text-xs w-full text-nowrap">
                {levels.map((level, idx) => (
                    <span
                        className={`base-1/${divide} text-center cursor-pointer ${per === BigInt(level) && color}`}
                        key={`level_${idx}`}
                        onClick={() => setPerAmount(BigInt(level))}
                    >
                        {level}
                        <span className="text-[9px]">%</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

export default RangeInput;
