const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require ('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = new express.Router()



router.post('/users', async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e){
        res.status(400).send(e)
    }


    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
})

router.post('/users/login', async (req,res)=>{
    try{    
        console.log("test1")
        const user = await User.findByCredentials(req.body.email, req.body.password)
        console.log("test2")
        const token = await user.generateAuthToken()
        await user.save()
        res.send({user, token})
        
        
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})



router.get('/users/me', auth ,async (req, res) =>{
    res.send(req.user)
    
})



router.patch('/users/me', auth,  async (req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:"Invalid update"})
    }

    // const _id = req.params.id
    // if (_id.length!==24){
    //     return res.status(400).send("UID must be 24 chars long")
    // }

    try{
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res)=>{
    const _id = req.user._id
    try{
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})


const upload = multer({
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload an image"))
        }
        cb(undefined, true)
    }
})

//first path from, then authenticate, then upload, then send back success message, then handle error
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    //req.user.avatar = req.file.buffer

    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar =  buffer

    await req.user.save()
    res.status(200).send()
},(error, req, res, next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
},(error, req, res, next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})










module.exports = router