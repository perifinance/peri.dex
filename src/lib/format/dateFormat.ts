export const dateFormat = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = ("0" + (1 + date.getMonth())).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hour = date.getHours();
    const mint = date.getMinutes();
    const second = date.getSeconds();
    return `${year}/${month}/${day} - ${hour < 10 ? `0${hour}`: hour}:${mint < 10 ? `0${mint}`: mint}:${second < 10 ? `0${second}`: second}`;
}