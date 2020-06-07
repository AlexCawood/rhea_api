const router = require('express').Router()
const multer = require('multer')
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
    if (!user[0]) return 
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_email = ?',[user[0].usr_email])
    if (!profile) return 
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
        const date = today_date()
        
        const insert_project = await conn(`
        INSERT INTO KRONOS.PROJECT (proj_name,proj_bio, proj_created_on, proj_prof_id)
        VALUES(?,?,?,?)
        `,[
            req.body.proj_name,
            req.body.proj_bio,
            date,
            prof[0].prof_id
        ])
        project_id = await conn("SELECT proj_id FROM KRONOS.PROJECT WHERE proj_name = ? and proj_prof_id = ? and proj_created_on = ? ",[req.body.proj_name,prof[0].prof_id,date])
        res.json( project_id[0]);

    } catch (error) {
        res.status(400).send('project not found')
        console.log(error);
        
    }
    


})
// Get user poject data
router.get('/all',verify, async (req,res) =>{
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    const projects = await conn('SELECT * FROM KRONOS.PROJECT WHERE proj_prof_id = ?',[prof[0].prof_id])
    if(!projects) return res.status(400).send('No projects found')

    res.json(projects)
})

// Get user poject data by project ID
router.get('/:id',verify, async (req,res) =>{
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    const projects = await conn('SELECT * FROM KRONOS.PROJECT WHERE proj_id = ?',[req.params.id])
    if(!projects[0]) return res.status(400).send('No projects found')

    res.json(projects)
})

// get all projects
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
    res.json({status:"success"})
})

router.get('/tags/:proj_id', verify, async (req,res)=>{
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')

    //const proj = await conn('SELECT proj_id FROM KRONOS.PROJECT WHERE proj_prof_id = ?')
    //const check_proj_exists = await conn('SELECT COUNT(*) AS proj_count FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.tag_proj_id])
    //if (check_proj_exists[0].proj_count === 0) return res.status(400).send('project does not exist')
    const tags = await conn('SELECT * FROM KRONOS.TAG WHERE tag_proj_id = ?',[req.params.proj_id])
    if (!tags[0]) return res.status(400).send("No Tags found")

    res.send(tags)
})

// media
// post to the media table

// File variable decleration


const storage = multer.diskStorage({
    destination: async function  (req, file, cb) {
        console.log(req.body.file_name);
        
        const media = await conn('SELECT med_name FROM KRONOS.MEDIA WHERE med_name = ?',[req.body.file_name])
        
        
        if (media[0]){ 
            req.body.file_name = null
            return cb('No file added', 'media/images')
        }
        cb(null, 'media/images')
    },
    filename: async function (req, file, cb) {
        cb(null, req.body.file_name)
    }
  })

  const upload = multer({ storage: storage })

var middleware = {
    verify: verify,
    imageUpload: upload.single('image')
}
router.post('/addmedia',[middleware.verify], async (req,res)=>{

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

        // let proj_name = await conn('SELECT proj_name FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.proj_id])
        //console.log(proj_name[0].proj_name);
        
        // generate the filename from project name, media title and the date
        let proj_id = String(req.body.proj_id)
        let media_title = media.med_title.replace(/\s/g, "_").toLowerCase()
        let date_formatted = today_date().replace(/-/g, "")
        const media_name = `${proj_id}_${media_title}_${String(media.med_position)}_${date_formatted}`
        media['med_location'] = 'media/images'
        //insert into data base
        const create_media = await conn(`INSERT INTO KRONOS.MEDIA (med_name,med_location, med_title, med_descp, med_type, med_position, med_proj_id,med_created_on) 
        VALUES(?,?,?,?,?,?,?,?);`,[media_name,media.med_location,media.med_title, media.med_descp, media.med_type, media.med_position, media.med_proj_id,today_date()])
        res.json({proj_id: proj_id,file_name: media_name})
    })
    
    
})

// saving the images with metadata
router.post('/addmedia/image',[middleware.verify, middleware.imageUpload],(req,res)=>{
    if (!req.body.file_name) return res.status(400).send('not image submited')
    res.send("Image saved")
})



// get from the media table
router.get('/media',verify ,async (req,res)=>{
    console.log(req.user);
    
    if (!req.user) return res.status(400).send('No user found')
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    //const check_proj_exists = await conn('SELECT COUNT(*) AS proj_count FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.proj_id])
    //if (check_proj_exists[0].proj_count === 0) return res.status(400).send('project does not exist')

    const proj_id = await conn('SELECT proj_id FROM KRONOS.PROJECT WHERE proj_prof_id = ?',[req.user._id])
    if(!proj_id) return res.status(400).send('No projects found')

    const get_media = await conn('SELECT *  FROM KRONOS.MEDIA WHERE med_proj_id = ?',[proj_id[0].proj_id])
    if(!get_media) return res.status(400).send('No media found')

    //multer

    res.json(get_media)
})

module.exports = router