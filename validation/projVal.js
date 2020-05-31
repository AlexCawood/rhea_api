const Joi = require('joi')


const tagVal = data =>{
    const schema ={
        tag_name: Joi.string().required()
    }

   return  Joi.validate(data, schema)
}

const projectVal = data =>{
    const schema ={
        proj_name: Joi.string().required(),
        proj_bio:  Joi.string().optional()
    }

   return  Joi.validate(data, schema)
}

const mediaVal = data =>{
    const schema ={
        med_location: Joi.string().max(255).required(),
        med_title:  Joi.string().max(30).required(),
        med_descp: Joi.string().optional(),
        med_type: Joi.string().max(30).required(),
        med_position: Joi.required(),
        med_proj_id: Joi.required()
    }

   return  Joi.validate(data, schema)
}



module.exports.tagVal = tagVal
module.exports.projectVal = projectVal
module.exports.mediaVal = mediaVal