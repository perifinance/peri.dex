import { useEffect, useState } from 'react';
import './loading.css'

const loading = () => {
    // const [colors, setColor] = useState([
    //     'bg-skyblue-500',
    //     'bg-pink-500',
    //     'bg-purple-500',
    //     'bg-skyblue-500',
    // ])

    return (
        <div>
            
            <div className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center">
                <div className="bg-gray-700 py-2 px-5 rounded-lg flex items-center flex-col">
                    <div className="absolute a w-10 h-14 mt-2">
                        <div className="absolute w-10 h-14"><div className="w-3 h-3 rounded-full bg-skyblue-500"></div></div>
                        <div className="absolute w-10 h-14"><div className="w-3 h-3 rounded-full bg-pink-500"></div></div>
                        <div className="absolute w-10 h-14"><div className="w-3 h-3 rounded-full bg-purple-500"></div></div>
                    </div>        
                    <div className="text-withe text-xs font-light mt-2 text-center">
                        Please wait...
                    </div>
                </div>
            </div>
        </div>
    );
}



export default loading;