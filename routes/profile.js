const router = require('express').Router()
const conn = require('../database')
const verify = require('../verifyToken')

router.get('/',verify,async (req,res)=>{
    const profile = await conn('SELECT * FROM KRONOS.PROFILE WHERE prof_usr_email = ?',[req.user._id])
    res.send(profile)
})


module.exports = router
