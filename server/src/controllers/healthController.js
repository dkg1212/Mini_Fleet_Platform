const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fleet API is running'
  });
};

module.exports = {
  getHealth
};

