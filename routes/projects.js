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

//Add Tags -- need to do (assumption, project id will be passed to this from front end)
router.post('/addtags',verify, async (req,res)=>{
    
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    const check_proj_exists = await conn('SELECT COUNT(*) AS proj_count FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.tag_proj_id])
    if (check_proj_exists[0].proj_count === 0) return res.status(400).send('project does not exist')


    Object.keys(req.body).forEach(async (tag)=>{

        //Iteration over all tags
        if (tag !== "tag_proj_id"){ 
            //Tags validation           
            const {error} = tagVal({"tag_name":req.body[tag]})
            if (error) return res.status(400).send(error.details[0].message + `, The failed tag is ${req.body[tag]}`)
            //Create Tag in tag table
            const create_tag = await conn('INSERT INTO KRONOS.TAG (tag_name,tag_proj_id) VALUES(?, ?);',[req.body[tag],req.body.tag_proj_id])
        }
        //add tag
        

    })
    res.send("recived Post")
})


//Add Media

module.exports = router