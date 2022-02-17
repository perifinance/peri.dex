export const formatTimestamp = (date:Date) => {   
    return Math.ceil(date.getTime() / 1000) 
}