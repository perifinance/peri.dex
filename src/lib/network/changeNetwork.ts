import networkInfo from 'configure/networkInfo/networkInfo'

export const changeNetwork = async (networkId) => {
    try {
    // @ts-ignore
        await window.ethereum?.request({
            method: 'wallet_switchEthereumChain',
            params: [{chainId: networkInfo[networkId].chainId}],
        });
    } catch (switchError) {
        console.log(switchError.code);
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === -32002) {
        try {
            // @ts-ignore
            await window.ethereum?.request({                            
                method: 'wallet_addEthereumChain',
                params: [networkInfo[networkId]],
            });
        } catch (addError) {
            console.log(addError);
        // handle "add" error
        }
    }
    // handle other "switch" errors
}}