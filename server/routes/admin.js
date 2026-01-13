const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Post = require('../models/Post');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

const adminLayout = '../templates/layouts/admin';


const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({message: 'Unauthorized'})
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch(err) {
        return res.status(401).json({message: 'Unauthorized'})
    }
}

router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Add post',
            description: 'Simple Blogs created with NodeJs, MongoDB'
        }
        res.render('admin/add-post', {locals, layout: adminLayout})
    } catch (err) {
        console.log(err)
    }
});

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Edit post',
            description: 'Simple Blogs created with NodeJs, MongoDB'
        }
        const post = await Post.findById(req.params.id)
        res.render('admin/edit-post', {locals, post, layout: adminLayout});
    } catch (err) {
        console.log(err)
    }
});


router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        res.redirect(`/admin/edit-post/${post._id}`)
    } catch (err) {
        console.log(err);
    }
});

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id)
        res.redirect('/admin/dashboard')
    } catch (err) {
        console.log(err);
    }
});


router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const post = new Post({
            title: req.body.title,
            body: req.body.body
        });

        console.log(post)

        await Post.create(post);

        res.redirect('/admin/dashboard')
    } catch (err) {
        console.log(err)
    }
})


router.get('/', async (req, res) => {
    try {
        const locals = {
            title: 'Admin',
            description: 'Simple Blogs created with NodeJs, MongoDB'
        }
        res.render('admin/index', {locals, layout: adminLayout})
    } catch (err) {
        console.log(err)
    }
});

router.post('/signin', async (req, res) => {
    try {
        const locals = {
            title: 'Admin',
            description: 'Simple Blogs created with NodeJs, MongoDB'
        }

        const {username, password} = req.body;
        const user = await User.findOne({username});

        console.log(user, req.body)
        if(!user) {
            return res.status(401).json({message: 'Invalid credentials'})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({message: 'Invalid credentials'})
        }

        const token = jwt.sign({userId: user._id}, JWT_SECRET);
        res.cookie('token', token, {httpOnly: true})
        

        res.redirect('/admin/dashboard')
    } catch (err) {
        console.log(err)
    }
});

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Dashboard',
            description: 'Simple Blogs created with NodeJs, MongoDB'
        }
        const posts = await Post.find();
        res.render('admin/dashboard', {locals, posts, layout: adminLayout})
    } catch (err) {
        
    }
    
})

router.post('/register', async (req, res) => {
    try {
        const locals = {
            title: 'Admin',
            description: 'Simple Blogs created with NodeJs, MongoDB'
        }

        const {username, password} = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10)
        
        const user = await User.create({username, password: hashedPassword});
        res.status(201).json({message: 'user created', user})

    } catch (err) {

        console.log(err);
        if(err.code && err.code == 11000) {
            res.status(409).json({message: 'User already in used'});
        } else {
            res.status(500).json({message: 'Internal service error'})
        } 
    }
});

router.get('/logout', async(req, res) => {
    res.clearCookie('token');
    res.redirect('/')
})

module.exports = router;