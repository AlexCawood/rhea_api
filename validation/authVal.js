var Joi = require('joi')


const signupVal = data =>{
    const schema ={
        prof_firstname: Joi.string().max(30).required(),
        prof_lastname: Joi.string().max(30).required(),
        prof_usr_email: Joi.string().max(60).required(),
        prof_gender: Joi.string().max(1).required(), 
        prof_bio: Joi.string(),
        prof_gender: Joi.string(), 
        prof_dob: Joi.string().min(10).max(10).required(),
        prof_image_loc: null,
        prof_edu_fac: null,
        prof_qualification: null,
        prof_grad_year: null,
        prof_is_grad: Joi.boolean(),
        prof_created_on: null,
        prof_hash: Joi.string().required()


    }

    return Joi.validate(data, schema)
}

const loginVal = data =>{
    const schema ={
        usr_email: Joi.string().email().max(60).required(),
        usr_hash: Joi.string().min(4).required()
    }

   return  Joi.validate(data, schema)
}

module.exports.signupVal = signupVal
module.exports.loginVal = loginVal