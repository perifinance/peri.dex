import { chartRate } from '../queries'
import { get } from '../service'
import { differenceInMonths,
    differenceInWeeks,
    differenceInDays,
    differenceInMinutes
} from 'date-fns';

export const getChartRates = async({currencyName = null, page = undefined, first = undefined, dataFrom = '15m'}) => {
    const dataFromNum = dataFrom.replace(/[a-z, A-Z]/g, '');
    const dataFromGroup = dataFrom.replace(/\d/g, '');
    let data = await get(chartRate({currencyName, page, first}));
    
    switch (dataFromGroup) {
        case 'M': data = data.concat(await get(chartRate({currencyName, page, first}))).concat(await get(chartRate({currencyName, page, first}))).concat(await get(chartRate({currencyName, page, first})));
            break;
        case 'W': data = data.concat(await get(chartRate({currencyName, page, first}))).concat(await get(chartRate({currencyName, page, first})));
            break;
        case 'D': data = data.concat(await get(chartRate({currencyName, page, first})));
            break;
        default: 
            break;
    }

    let dayFlag;
    let values = [];
    
    data.forEach(item => {
        let differenceIn;
        switch (dataFromGroup) {
            case 'M': differenceIn = differenceInMonths;
                break;
            case 'W': differenceIn = differenceInWeeks;
                break;
            case 'D': differenceIn = differenceInDays;
                break;
            case 'm': differenceIn = differenceInMinutes;
                break;
            default: differenceIn = differenceInDays;
                break;
        }
        
        if(dayFlag && differenceIn(new Date(item.timestamp * 1000), dayFlag) < Number(dataFromNum) ) {
            values[values.length-1].low = BigInt(values[values.length-1].low) < BigInt(item.low) ? values[values.length-1].low : item.low
            values[values.length-1].price = item.price;
            values[values.length-1].high = BigInt(values[values.length-1].high) > BigInt(item.high) ? values[values.length-1].high : item.high
        } else {
            dayFlag = new Date(item.timestamp * 1000);
            values.push({...item});
        } 
    });
    return values;
}