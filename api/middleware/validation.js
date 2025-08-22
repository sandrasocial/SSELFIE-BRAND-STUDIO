const Joi = require('joi');

const schemas = {
  train: Joi.object({
    training_images: Joi.array().items(Joi.string()).required(),
    brand_preferences: Joi.object({
      style: Joi.string().required(),
      color_palette: Joi.array().items(Joi.string()).required(),
      mood: Joi.string().required()
    }).required()
  }),

  style: Joi.object({
    occasion: Joi.string().required(),
    brand_identity: Joi.string().required(),
    color_preferences: Joi.array().items(Joi.string()).required()
  }),

  shoot: Joi.object({
    shoot_type: Joi.string().required(),
    environment: Joi.string().required(),
    desired_outcome: Joi.string().required()
  }),

  build: Joi.object({
    template_id: Joi.string().required(),
    brand_assets: Joi.object({
      logo: Joi.string().required(),
      colors: Joi.array().items(Joi.string()).required(),
      fonts: Joi.array().items(Joi.string()).required()
    }).required(),
    content: Joi.object({
      about: Joi.string().required(),
      services: Joi.array().items(Joi.string()).required(),
      portfolio: Joi.array().items(Joi.string()).required()
    }).required()
  })
};

const validateRequest = (schemaName) => {
  return (req, res, next) => {
    const { error } = schemas[schemaName].validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    next();
  };
};

module.exports = {
  validateRequest
};