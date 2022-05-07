//din't understood
module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
