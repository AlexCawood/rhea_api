const router = require('express').Router()
const conn = require('../database')
const verify = require('../verifyToken')

const profile = async (id) =>{
    const user = await conn('SELECT * FROM KRONOS.USER WHERE usr_id = ?',[id])
    if (!user[0]) return 
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_email = ?',[user[0].usr_email])
    if (!profile) return 
    return profile
}

router.get('/',verify,async (req,res)=>{
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_id = ?',[req.user._id])
    if (!profile) return res.status(400).send('Profile not found')
    res.json(profile)
})


router.put('/edit/:id', verify, async (req,res)=>{

    try {
        let updated_info = {} 
        const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_id = ?',[req.params.id])
        if (!profile[0]) return res.status(400).send('Profile not found')


        if(req.body.prof_firstname != profile.prof_firstname){
            const update_firstname = await conn('UPDATE KRONOS.PROFILE SET prof_firstname = ? WHERE prof_id = ?;',
            [req.body.prof_firstname,profile[0].prof_id])
            updated_info['prof_firstname'] = req.body.prof_firstname
        }

        if(req.body.prof_lastname != profile.prof_lastname){
            const update_lastname = await conn('UPDATE KRONOS.PROFILE SET prof_lastname = ? WHERE prof_id = ?;',
            [req.body.prof_lastname,profile[0].prof_id])
            updated_info['prof_lastname'] = req.body.prof_lastname
        }

        if(req.body.prof_gender != profile.prof_gender){
            const update_gender = await conn('UPDATE KRONOS.PROFILE SET prof_gender = ? WHERE prof_id = ?;',
            [req.body.prof_gender, profile[0].prof_id])
            updated_info['prof_gender'] = req.body.prof_gender
        }

        if(req.body.prof_bio != profile.prof_bio){
            const update_bio = await conn('UPDATE KRONOS.PROFILE SET prof_bio = ? WHERE prof_id = ?;',
            [req.body.prof_bio, profile[0].prof_id])
            updated_info['prof_bio'] = req.body.prof_bio
        }

        if(req.body.prof_dob != profile.prof_dob){
            const update_dob = await conn('UPDATE KRONOS.PROFILE SET prof_dob = ? WHERE prof_id = ?;',
            [req.body.prof_dob, profile[0].prof_id])
            updated_info['prof_dob'] = req.body.prof_dob
        }

        if(req.body.prof_edu_fac != profile.prof_edu_fac){
            const update_edu_fac = await conn('UPDATE KRONOS.PROFILE SET prof_edu_fac = ? WHERE prof_id = ?;',
            [req.body.prof_edu_fac, profile[0].prof_id])
            updated_info['prof_edu_fac'] = req.body.prof_edu_fac
        }

        if(req.body.prof_qualification != profile.prof_qualification){
            const update_qualification = await conn('UPDATE KRONOS.PROFILE SET prof_qualification = ? WHERE prof_id = ?;',
            [req.body.prof_qualification, profile[0].prof_id])
            updated_info['prof_qualification'] = req.body.prof_qualification
        }

        if(req.body.prof_grad_year != profile.prof_grad_year){
            const update_grad_year = await conn('UPDATE KRONOS.PROFILE SET prof_grad_year = ? WHERE prof_id = ?;',
            [req.body.prof_grad_year, profile[0].prof_id])
            updated_info['prof_grad_year'] = req.body.prof_grad_year
        }

        if(req.body.prof_is_grad != profile.prof_is_grad){
            const update_is_grad = await conn('UPDATE KRONOS.PROFILE SET prof_is_grad = ? WHERE prof_id = ?;',
            [req.body.prof_is_grad, profile[0].prof_id])
            updated_info['prof_is_grad'] = req.body.prof_is_grad
        }


        res.send(updated_info)

    } catch (error) {
        console.log(req.body);
        
        res.send(error)
    }
    

})

module.exports = router
