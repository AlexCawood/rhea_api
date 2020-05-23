const router = require('express').Router()
const Joi = require('joi')
const jwt = require('jsonwebtoken')

const conn = require('../database')
const bcrypt = require('bcryptjs')
const {signupVal, loginVal} = require('../validation/authVal')



router.post('/signup', async (req,res)=>{
    // Validations
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
        usr_hash: Joi.string().required()


    }
    const result = Joi.validate(req.body, schema)
    if(result.error){
        res.status(400).send(`Error: ${result.error}`)
        console.log(result.error);
        return
    }
    
    //Check if email exists
    const user_count = await conn('SELECT COUNT(usr_email) AS user_count FROM KRONOS.USER WHERE usr_email = ?',[req.body.usr_email])
    if (parseInt(user_count[0].user_count) >0 ) return res.status(400).send('User already exists')

    //Hashing
    const salt = await bcrypt.genSalt(10)
    const hashpass = await bcrypt.hash(req.body.prof_hash, salt)
    
    // Adding database users
    try {
       const inser_user = await conn('INSERT INTO KRONOS.USER (usr_email, usr_hash, usr_created_on) VALUES(?,?,CURRENT_TIMESTAMP());',
       [req.body.usr_email,hashpass])
        const user = await conn('SELECT usr_id, usr_email FROM KRONOS.USER WHERE usr_email = ?',[req.body.usr_email])

        const inser_profile = await conn(`INSERT INTO KRONOS.PROFILE (
            prof_firstname, 
            prof_lastname,
            prof_usr_email,
            prof_bio,
            prof_gender,
            prof_dob, -- must be a string
            prof_image_loc,
            prof_edu_fac,
            prof_qualification,
            prof_grad_year,
            prof_is_grad,
            prof_created_on,
            prof_usr_id) 
            VALUES(?,?,?,?,?, ?, ?,?,?,?,?,CURRENT_TIMESTAMP(),?)`,
            [
                req.body.prof_firstname,
                req.body.prof_lastname,
                user[0].usr_email,
                req.body.prof_bio,
                req.body.prof_gender,
                req.body.prof_dob,
                req.body.prof_image_loc,
                req.body.prof_edu_fac,
                req.body.prof_qualification,
                req.body.prof_grad_year,
                req.body.prof_is_grad,
                user[0].usr_id

             ])
        status = {
            success:true,
            msg:`Successfully created user ${req.body.prof_firstname}`
        }
        res.send(status)
        console.log('Success')
        
    } catch (error) {
        console.log(error);
        res.status(400).send('User not added')
           
    }


})

router.post('/signin', async (req,res) =>{
    // Validation
    const {error} = loginVal(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    //Check if email exists
    const user_count = await conn('SELECT COUNT(usr_email) AS user_count FROM KRONOS.USER WHERE usr_email = ?',[req.body.usr_email])
    
    if (parseInt(user_count[0].user_count) === 0 ) return res.status(400).send('User does not exists')

    //get user
    try {
        const user = await conn('SELECT * FROM KRONOS.USER WHERE usr_email = ?',[req.body.usr_email])
        
        const valHash =  await bcrypt.compare(req.body.usr_hash,user[0].usr_hash)
        if(!valHash) return res.status(400).send('Invalid Password')
        
        const token = jwt.sign({_id:user[0].usr_email}, process.env.TOKEN_SECRET)
        res.header('auth-token',token).send(token)

        
    } catch (error) {
        res.status(400).send('Bad request')
        console.log(error);
        
    }
   
})

module.exports = router