const CalculateTips = (total, tips = 0.25) => {
  return total * tips + total;
};

module.exports = {
  CalculateTips,
};
