import { balance } from '../queries'
import { get } from '../service'

import pynths from 'configure/coins/pynths'

export const getBalances = ({currencyName = undefined, networkId = undefined, address, rates = undefined}) => {
  if(currencyName) {
    return get(balance({currencyName: currencyName, address: address}))
  } else {
    const promises = [];
    pynths[networkId].forEach(element => {
      promises.push(get(balance({currencyName: element.symbol, address: address, rate: rates[element.symbol]})));
    });
    return Promise.all(promises)
  }
}