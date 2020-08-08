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
        INSERT INTO KRONOS.PROJECT (proj_name,proj_bio, proj_created_on, proj_prof_id, proj_active,template_id)
        VALUES(?,?,?,?,?,?)
        `,[
            req.body.proj_name,
            req.body.proj_bio,
            date,
            prof[0].prof_id,
            true,
            req.body.template_id
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
    if (!prof[0]) return res.status(400).send('No Profile for user')
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

// deativate project
router.delete('/:id',verify, async (req,res)=>{
    console.log(req.params.id)
    console.log(req.user._id)
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    const update_projects = await conn('UPDATE KRONOS.PROJECT SET proj_active = false WHERE proj_id = ?',[req.params.id])
    const projects = await conn('SELECT * FROM KRONOS.PROJECT WHERE proj_id = ? AND proj_atcive = false' ,[req.params.id])
    if(!projects[0]) return res.status(400).send('No projects found')

    res.json({"status":true})
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
            const create_tag = await conn('INSERT INTO KRONOS.TAG (tag_name,tag_proj_id, tag_active) VALUES(?, ?, ?);',[req.body[tag],req.body.tag_proj_id,true])
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

//search terms -- check for sql inject vulrablilities
router.get('/search/:term',async (req,res)=>{
    try {
    let search_term = req.params.term 
    search_term = search_term.replace(/[^\w\s]/gi, '')

    const search = await conn(`SELECT * FROM KRONOS.PROJECT WHERE proj_name like '%${search_term}%' or proj_bio like '%${search_term}%' `)
    if(!search[0]) return res.json({search:'No projects found with term: ' + search_term})
    res.json(search)
    } catch (error) {
        res.send('Invalid search')
        console.log(error);
        
    }

})


// Edit Project
router.put('/:id/edit',verify ,async (req,res)=>{
    console.log('this running?');
    
    if (!req.user) return res.status(400).send('No user found')
    const prof = await profile(req.user._id)
    if (!req.body) return res.status(400).send('No data')
    let proj_update={}
    Object.keys(req.body).forEach(async key =>{
        if (req.body[key] && key != 'proj_id' && key != 'proj_prof_id'){
            proj_update[key] = req.body[key]
            const update_proj = await conn(`UPDATE KRONOS.PROJECT SET ${key} = "${req.body[key]}" where proj_id = ${req.params.id} AND proj_prof_id = ${prof[0].prof_id};`)
        }
    })

    res.send(proj_update)
})

router.delete('/:id/edit/tag',verify , async (req,res)=>{

    if (!req.user) return res.status(400).send('No user found')
    const prof = await profile(req.user._id)
    if (!req.body) return res.status(400).send('No data')
    let tag_delete = {}
    Object.keys(req.body).forEach(async key =>{
        if (key != 'tag_proj_id'){
            tag_delete[key] = req.body[key]
            const update_tag = await conn(`UPDATE KRONOS.TAG SET tag_active = false WHERE tag_proj_id = ${req.params.id} AND tag_name = "${req.body[key]}";`)
        }
    })
    res.send(tag_delete)
})


module.exports = router