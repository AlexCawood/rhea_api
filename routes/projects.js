const router = require('express').Router()
const conn = require('../database')
const verify = require('../verifyToken')
const {projectVal, tagVal,mediaVal} = require('../validation/projVal')

const today_date = ()=>{
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = `${yyyy}-${mm}-${dd}`;
    return today
}
// Check profile exists
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
// Get the poject data
router.get('/userprojects',verify, async (req,res) =>{
    const prof = await profile(req.user._id)
    console.log(prof);
    
    const projects = await conn('SELECT * FROM KRONOS.PROJECT WHERE proj_prof_id = ?',[prof[0].prof_id])
    if(!projects) return res.status(400).send('No projects found')

    res.json(projects)
})
router.get('/', async (req,res) =>{
    
    const projects = await conn('SELECT * FROM KRONOS.PROJECT')
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

    })
    res.send("recived Post")
})

router.get('/tags', verify, async (req,res)=>{
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    const check_proj_exists = await conn('SELECT COUNT(*) AS proj_count FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.tag_proj_id])
    if (check_proj_exists[0].proj_count === 0) return res.status(400).send('project does not exist')


})

// media
// post to the media table
router.post('/addmedia',verify, async (req,res)=>{

    // gaurd for user exists
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    // gaurd check if project exists
    const check_proj_exists = await conn('SELECT COUNT(*) AS proj_count FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.proj_id])
    if (check_proj_exists[0].proj_count === 0) return res.status(400).send('project does not exist')

    // media data 
    const media_list = req.body.med_media

    media_list.map(async (media)=>{
        console.log(media);
        
        const {error} = mediaVal(media)
        if (error) return res.status(400).send(error.details[0].message + `, The failed media is ${media.med_title}`)

        let proj_name = await conn('SELECT proj_name FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.proj_id])
        console.log(proj_name[0].proj_name);
        
        // generate the filename from project name, media title and the date
        proj_name = proj_name[0].proj_name.replace(/\s/g, "_").toLowerCase()
        let media_title = media.med_title.replace(/\s/g, "_").toLowerCase()
        let date_formatted = today_date().replace(/-/g, "")
        const media_name = `${proj_name}_${media_title}_${String(media.med_position)}_${date_formatted}`

        //insert into data base
        const create_media = await conn(`INSERT INTO KRONOS.MEDIA (med_name,med_location, med_title, med_descp, med_type, med_position, med_proj_id,med_created_on) 
        VALUES(?,?,?,?,?,?,?,?);`,[media_name,media.med_location,media.med_title, media.med_descp, media.med_type, media.med_position, media.med_proj_id,today_date()])
        res.send("recived Post")
    })
    
    
})

// get from the media table
router.get('/media',verify, async (req,res)=>{
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    //const check_proj_exists = await conn('SELECT COUNT(*) AS proj_count FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.proj_id])
    //if (check_proj_exists[0].proj_count === 0) return res.status(400).send('project does not exist')

    const proj_id = await conn('SELECT proj_id FROM KRONOS.PROJECT WHERE proj_prof_id = ?',[req.user._id])
    if(!proj_id) return res.status(400).send('No projects found')

    const get_media = await conn('SELECT *  FROM KRONOS.MEDIA WHERE med_proj_id = ?',[proj_id[0].proj_id])
    if(!get_media) return res.status(400).send('No media found')

    res.json(get_media)
})

module.exports = router