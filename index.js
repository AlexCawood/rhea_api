var express = require('express')
var Joi = require('joi')
var app = express()
var mysql = require('mysql')
var conn = mysql.createConnection({
  host: 'ouranus-mysql.cjmnjbi3if5u.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'KrackSnaCssg1987',
  database: 'KRONOS'
})

app.use(express.json())




// const usr =  [{
//         id:1,
//         user:'Alex',
//         password:'1234'
//     },
//     {
//         id:2,
//         user:'Alice',
//         password:'1234'
//     }
// ]

app.get('/api/users', (req,res) => {
        conn.query('SELECT * FROM KRONOS.USER', function (err, rows, fields) {
            if (err) throw err
            res.send(rows)
            console.log('Result: ', rows)
      })
    
})


app.get('/api/users/:id', (req,res) => {

    let usr_id = parseInt(req.params.id)
    
    const user = usr.find(user=>user.id === usr_id)
    if(!user){
        res.status(400).send('User not found')
    }
    res.send(user)
})

app.post('/api/users', (req,res)=>{
    // const schema ={
    //     name: Joi.string().min(3).required()
    // } 

    // const result = Joi.validate(req.body, schema)
    // if(result.error){
    //     res.status(400).send(`Error: ${result.error}`)
    //     return
    // }
    const user ={
        id: usr.length +1,
        name: req.body.name,
        password: req.body.pass
    }
    usr.push(user)
    res.send(user)
})

app.post('/api/signup', (req,res)=>{
    const schema ={
        prof_firstname: Joi.string().max(30).required(),
        prof_lastname: Joi.string().max(30).required(),
        prof_usr_email: Joi.string().max(60).required(),
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
        prof_hash: Joi.string().required()


    }
    console.log(req.body)
    const result = Joi.validate(req.body, schema)
    if(result.error){
        res.status(400).send(`Error: ${result.error}`)
        console.log(result.error);
        return
    }
    conn.query('INSERT INTO KRONOS.USER (usr_email, usr_hash, usr_created_on) VALUES(?,?,CURRENT_TIMESTAMP());',[req.body.prof_usr_email,req.body.prof_hash], function (err, rows, fields) {
        if (err) throw err
        conn.query('SELECT usr_id, usr_email FROM KRONOS.USER WHERE usr_email = ?',[req.body.prof_usr_email],(err,rows,fields)=>{
            if (err) throw err
            conn.query(`INSERT INTO KRONOS.PROFILE (
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
                    rows[0].usr_email,
                    req.body.prof_bio,
                    req.body.prof_gender,
                    req.body.prof_dob,
                    req.body.prof_image_loc,
                    req.body.prof_edu_fac,
                    req.body.prof_qualification,
                    req.body.prof_grad_year,
                    req.body.prof_is_grad,
                    rows[0].usr_id

                 ],
                 (err,rows,fields)=>{
                    if (err) throw err
                    status = {
                        success:true,
                        msg:`Successfully created user ${req.body.prof_firstname}`
                    }
                    res.send(status)
                    console.log('Success')
            })
        })
  })
})

app.listen(3000,()=>{console.log('Listening on port 3000')})