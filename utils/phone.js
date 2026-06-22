const normalizePhone = (phone) => {
  if (!phone) return "";

  let value = String(phone).replace(/\D/g, "");

  if (value.startsWith("91") && value.length === 12) {
    value = value.slice(2);
  }

  return value.slice(-10);
};

module.exports = normalizePhone;