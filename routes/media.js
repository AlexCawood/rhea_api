
const router = require('express').Router()
const multer = require('multer')
const conn = require('../database')
const verify = require('../verifyToken')
const {mediaVal} = require('../validation/projVal')


const profile = async (id) =>{
    const user = await conn('SELECT * FROM KRONOS.USER WHERE usr_id = ?',[id])
    if (!user[0]) return 
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_email = ?',[user[0].usr_email])
    if (!profile) return 
    return profile
}
const today_date = ()=>{
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = `${yyyy}-${mm}-${dd}`;
    return today
}

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb("Please upload only images.", false);
    }
  };


const storage = multer.diskStorage({
    destination: async function  (req, file, cb) {
        console.log(req.body.file_name);
        
        const media = await conn('SELECT med_name FROM KRONOS.MEDIA WHERE med_name = ?',[req.body.file_name])
        //console.log(media[0]);
        
        
        if (!media[0]){ 
            req.body.file_name = null
            return cb('No file added', 'media/images')
        }
        cb(null, 'routes/media/images')
    },
    filename: async function (req, file, cb) {
        cb(null, `${req.body.file_name}.jpg`)
    }
  })

  const upload = multer({ storage: storage,
    imageFilter:imageFilter })

  let middleware = {
    verify: verify,
    imageUpload: upload.single('image')
}
// Add media, 
  router.post('/addmedia',[middleware.verify], async (req,res)=>{

    // gaurd for user exists
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    // gaurd check if project exists
    const check_proj_exists = await conn('SELECT COUNT(*) AS proj_count FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.proj_id])
    if (check_proj_exists[0].proj_count === 0) return res.status(400).send('project does not exist')

    let med_name_obj = {
        proj_id:req.body.proj_id,
        media:[]
    };
    // media data 
    const media_list = req.body.med_media

    media_list.map(async (media)=>{
        
        
        
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
        med_name_obj.media.push({media_title:media.med_title,media_position:media.med_position,file_name:media_name});
        //insert into data base
        const media_name_check = await conn('SELECT med_name FROM KRONOS.MEDIA WHERE med_name = ?',[media_name])
        if(media_name_check[0]) return res.status(400).send("Name for image already exists in project");

        const create_media = await conn(`INSERT INTO KRONOS.MEDIA (med_name,med_location, med_title, med_descp, med_type, med_position, med_proj_id,med_created_on,med_active) 
        VALUES(?,?,?,?,?,?,?,?,?);`,[media_name,media.med_location,media.med_title, media.med_descp, media.med_type, media.med_position, media.med_proj_id,today_date(),true])
        
    })
    //const media_name = await conn('SELECT med_name FROM KRONOS.MEDIA WHERE med_proj_id = ?',[req.body.proj_id])
    res.json(med_name_obj)
    
    
})

// saving the images with metadata
router.post('/addmedia/image',[middleware.verify, middleware.imageUpload],(req,res)=>{
    if (!req.body.file_name) return res.status(400).send('not image submited')
    res.send("Image saved")
})



// get from the media table
router.get('/:id',verify ,async (req,res)=>{
    
    if (!req.user) return res.status(400).send('No user found')
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    //const check_proj_exists = await conn('SELECT COUNT(*) AS proj_count FROM KRONOS.PROJECT WHERE proj_id = ?',[req.body.proj_id])
    //if (check_proj_exists[0].proj_count === 0) return res.status(400).send('project does not exist')
    
    const proj_id = await conn(`SELECT * FROM KRONOS.MEDIA M INNER JOIN KRONOS.PROJECT P ON M.MED_PROJ_ID = P.PROJ_ID WHERE PROJ_ID = ${req.params.id} AND proj_prof_id = ${req.user._id};`)
    if(!proj_id[0]) return res.status(400).send('No Media with Project ID:'+req.params.id)

    const get_media = await conn('SELECT *  FROM KRONOS.MEDIA WHERE med_proj_id = ?',[proj_id[0].proj_id])
    if(!get_media[0]) return res.status(400).send('No media found')
    
    //multer

    res.json(get_media)
})

// get images from media
router.get('/:id/:med_id',verify ,async (req,res)=>{
    // Auth users
    if (!req.user) return res.status(400).send('No user found')
    const prof = await profile(req.user._id)
    if (!prof) return res.status(400).send('No Profile for user')
    
    // get projects and media
    const proj_media = await conn(`SELECT * FROM KRONOS.MEDIA M INNER 
    JOIN KRONOS.PROJECT P ON M.MED_PROJ_ID = P.PROJ_ID 
    WHERE PROJ_ID = ${req.params.id} AND proj_prof_id = ${req.user._id} AND MED_ID = ${req.params.med_id};`)
    if(!proj_media[0]) return res.status(400).send('No Media with Project ID:'+req.params.id)

    // return the image and file location
    const file_loc = `/${proj_media[0].med_location}/${proj_media[0].med_name}.jpg`
    res.sendFile(__dirname +file_loc)
})

// edit media, change a media entry by parsing the project id and the media id 
router.put('/:id',verify , async (req,res)=>{
    
    if (!req.user) return res.status(400).send('No user found')
    const prof = await profile(req.user._id)
    if (!req.body) return res.status(400).send('No data')
    let media_update = {}
    
    
    const media_list = req.body.med_media

    media_list.map(async (media)=>{

        //const {error} = mediaVal(media)
        //if (error) return res.status(400).send(error.details[0].message + `, The failed media is ${media.med_title}`)

        if (media['med_id']){
        Object.keys(media).forEach(async key =>{
            const media_update = await conn('SELECT * FROM KRONOS.MEDIA WHERE med_id = ? AND med_proj_id = ?',
                [media.med_id, media.med_proj_id])
            if(!media_update[0]) return res.status(400).send('No Media found')

            if (key != 'med_id' || key != 'med_proj_id'){
                    media_update[key] = media[key]
                    const update_media = await conn(`UPDATE KRONOS.MEDIA SET ${key} = ? WHERE med_proj_id = ? AND med_id = ?;`,
                    [media[key], req.params.id, media['med_id']])
                    
                }       
        
            })
        } 

    })
    
    res.send(media_update)
})
// delete based on project id, parse an object with the poject id and media id to be deleted
router.delete('/:id', verify, async (req,res) =>{

    if (!req.user) return res.status(400).send('No user found')
    const prof = await profile(req.user._id)
    if (!req.body) return res.status(400).send('No data')
    // check project exists
    const media_delete_dic = await conn('SELECT * FROM KRONOS.MEDIA WHERE med_id = ? AND med_proj_id = ?',
    [req.body.med_id, req.body.med_proj_id])
    
    if(!media_delete_dic[0]) return res.status(400).send('No Media found')

    const media_delete = await conn('UPDATE KRONOS.MEDIA SET med_active = false WHERE med_proj_id = ? AND med_id = ?;',
        [req.body.med_proj_id,req.body.med_id])

    res.send(media_delete_dic[0])
})

module.exports = router