const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
};

const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
};

export { formatCurrency, formatDate };
