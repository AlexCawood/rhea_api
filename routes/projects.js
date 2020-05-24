const router = require('express').Router()
const conn = require('../database')
const verify = require('../verifyToken')
const {projectVal, tagVal} = require('../validation/projVal')

const profile = async (id) =>{
    const user = await conn('SELECT * FROM KRONOS.USER WHERE usr_id = ?',[id])
    if (!user) return res.status(400).send('Access Denied')
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_email = ?',[user[0].usr_email])
    if (!profile) return res.status(400).send('Access Denied')
    return profile
}
// Add a project
router.post('/addproject',verify ,async (req,res)=>{
    // Validation
    const {error} = projectVal(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    //Save to Database
    try {
        const prof = await profile(req.user._id)
        
        
        const insert_project = await conn(`
        INSERT INTO KRONOS.PROJECT (proj_name,proj_bio, proj_created_on, proj_prof_id)
        VALUES(?,?,CURRENT_TIMESTAMP(),?)
        `,[
            req.body.proj_name,
            req.body.proj_bio,
            prof[0].prof_id
        ])
        res.send('Success');

    } catch (error) {
        res.status(400).send('project not found')
        console.log(error);
        
    }
    


})

router.get('/',verify, async (req,res) =>{
    const prof = await profile(req.user._id)
    console.log(prof);
    
    const projects = await conn('SELECT * FROM KRONOS.PROJECT WHERE proj_prof_id = ?',[prof[0].prof_id])
    if(!projects) return res.status(400).send('No projects found')

    res.json(projects)
})
//Add Tags -- need to do (assumption, project id will be passes to this from front end)
router.post('/addtags',verify, async (req,res)=>{
    //validation
    const {error} = tagVal(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    //Add to databse
    const prof = await profile(req.user._id)
})


module.exports = router