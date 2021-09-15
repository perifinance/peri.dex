export const formatDecimal = (value, decimal) => {
    if(decimal === 18) {
        return value;
    } else {
        return value * BigInt(Math.pow(10, 18 - decimal).toString());
    }
}