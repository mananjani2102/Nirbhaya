const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const errMessages = errors.array().map(e => e.msg);
    return res.status(400).json({ success: false, message: errMessages[0], errors: errMessages });
  };
};

module.exports = { validate };
