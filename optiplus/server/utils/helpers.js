const generateRegNumber = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `M/${year}/${month}/${random}`;
};

const generateReference = () => {
    const date = new Date();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REF${date.getFullYear()}${date.getMonth() + 1}${random}`;
};

module.exports = {
    generateRegNumber,
    generateReference
};