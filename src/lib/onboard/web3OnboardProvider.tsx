import { ReactNode, useEffect, useRef } from 'react';
import { OnboardContext, CleanupOnboard, initOnboard } from './web3Onboard';


interface Props {
	children: ReactNode;
}

export const Web3OnboardProvider: React.FC<Props> = ({ children }) => {
	const ref = useRef<any>(null);


	useEffect(() => {
		ref.current  = initOnboard('dark', false);

		return () => {
			ref.current = null; 
		};
	}, []);
	
	// Provide the initialized onboard object to children
	return (
		<>
			<OnboardContext.Provider value={ref.current}>
				{children}
			</OnboardContext.Provider>
			<CleanupOnboard/>
		</>
	);
};