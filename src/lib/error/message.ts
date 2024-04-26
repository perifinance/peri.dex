export const extractMessage = (err) => {
    let message = err.error?.message
        ? err.error.message.replace("execution reverted: ", "")
        : err.data?.message
        ? err.data.message
        : err.message
        ? err.message.substring(0, 40) + "..."
        : err.toString().substring(0, 40) + "...";
    return message;
};
