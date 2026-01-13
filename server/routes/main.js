const express = require('express');
const router = express.Router();

const Post = require('../models/Post')

router.get('', async (req, res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple blog page to demonstrate NodeJS"
        }

        let postPerPage = 3;
        let page = req.query.page || 1;

        const posts = await Post.aggregate([{$sort: {createdAt: -1}}])
            .skip(postPerPage*page - postPerPage)
            .limit(postPerPage)
            .exec();

        const count = await Post.estimatedDocumentCount();

        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count/postPerPage)

        res.render('index' , {
            locals, 
            posts, 
            current: page, 
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch(err) {
        console.log(err);
    }
});
router.get('/post/:id', async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        const locals = {
            title: post.title,
            description: "Simple blog page to demonstrate NodeJS"
        }

        res.render('post', {locals, post});
    } catch(err) {
        console.log(err)
    }
});

router.post('/search', async(req, res) => {
    try {

        const locals = {
            title: 'Search',
            description: "Simple blog page to demonstrate NodeJS"
        }

        let searchTerm = req.body.searchTerm;
        const sanitizedSerchTerm = searchTerm.replace(/[^a-zA-Z0-9]/g, '');
        console.log({sanitizedSerchTerm})

        const posts = await Post.find({
            $or: [
                {title: {$regex: new RegExp(sanitizedSerchTerm, 'i')}},
                {body: {$regex: new RegExp(sanitizedSerchTerm, 'i')}}
            ]
        })


        res.render('search', {locals, posts})
    } catch(err) {
        console.log(err)
    }
})


router.get('/about', (req, res) => {
    res.render('about', {currentRoute: '/about'});
});

router.get('/contact', (req, res) => {
    res.render('contact', {currentRoute: '/contact'});
});

module.exports = router;