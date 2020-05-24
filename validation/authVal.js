const Joi = require('joi')


const signupVal = data =>{
    const schema ={
        prof_firstname: Joi.string().max(30).required(),
        prof_lastname: Joi.string().max(30).required(),
        usr_email: Joi.string().max(60).required(),
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
        usr_hash: Joi.string().min(8).required()


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
    //     proj_id INTEGER NOT NULL AUTO_INCREMENT UNIQUE,
    //     proj_name VARCHAR(60) NOT NULL,
    //     proj_bio TEXT NULL,
    //     proj_created_on DATE NOT NULL,
    //     proj_prof_id INTEGER NOT NULL,





module.exports.signupVal = signupVal
module.exports.loginVal = loginVal

