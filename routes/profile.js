const router = require('express').Router()
const conn = require('../database')
const verify = require('../verifyToken')
const { route } = require('./media')
const multer = require('multer')

const profile = async (id) =>{
    const user = await conn('SELECT * FROM KRONOS.USER WHERE usr_id = ?',[id])
    if (!user[0]) return 
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_email = ?',[user[0].usr_email])
    if (!profile) return 
    return profile
}

router.get('/',verify,async (req,res)=>{
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_id = ? AND prof_active = true',[req.user._id])
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

router.delete('/',verify,async (req,res)=>{
    const del_profile = await conn('UPDATE KRONOS.PROFILE SET prof_active = false WHERE prof_usr_id = ?',[req.user._id])
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_id = ? AND prof_active = false',[req.user._id])
    const del_usr = await conn('UPDATE KRONOS.USER SET usr_active = false WHERE usr_id = ?',[profile[0].prof_usr_id])
    
    res.json({"status":true})
})


// Adding a profile picture:

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb("Please upload only images.", false);
    }
  };


const storage = multer.diskStorage({
    destination: async function  (req, file, cb) {
        //console.log(req.body.file_name);
        
        //const media = await conn('SELECT PROF_IMAGE_LOC FROM KRONOS.MEDIA WHERE PROF_USR_EMAIL = ?',[req.body.file_name])
        //console.log(media[0]);
        
        
        // if (!media[0]){ 
        //     req.body.file_name = null
        //     return cb('No file added', 'media/images')
        // }
        cb(null, 'routes/media/profileImage')
    },
    filename: async function (req, file, cb) {
        let image_name = req.body.file_name.replace('@','');
        image_name = image_name.replace('\.','');
        console.log(image_name);
        const image_loc = `routes/media/profileImage/${image_name}.jpg`
        const update_profile_loc = await conn('UPDATE KRONOS.PROFILE SET PROF_IMAGE_LOC = ? WHERE PROF_ID = ? ', [image_loc, req.body.prof_id])
        cb(null, `${image_name}.jpg`)
    }
  })

  const upload = multer({ storage: storage,
    imageFilter:imageFilter })

  let middleware = {
    verify: verify,
    imageUpload: upload.single('image')
}

router.post('/', [middleware.verify,middleware.imageUpload], async (req,res)=>{
    if (!req.body.prof_id) return res.status(400).send('no profile ID submited')
    if (!req.body.file_name) return res.status(400).send('no image name submited')
    //console.log(req.file);
    if (!req.file) return res.status(400).send('no image submited')
    res.send("Image saved")
})


module.exports = router
