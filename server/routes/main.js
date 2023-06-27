const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

//get method and a home route
//     Home page and request responce function '' refers to home [ade]
router.get('', async (req, res) => {
    try {
        const locals = {        //basic object example of passing data
            title: "nodejs blog",
            description: "this is a basic nodejs blog"
        }
        
        let perPage = 6;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{$sort: { createdAt: -1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index',{ 
            locals, 
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
         });
    } catch (error) {
        console.log(error);
    }
});

// get Post: id
router.get('/post/:id', async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({_id: slug });
  
    const locals = {
        title: data.title,
        description: "Simple Blog created with NodeJs, Express & MongoDb."
        
    }
    res.render('post', { locals, data, currentRoute: `/post/&{slug}` });
  } catch (error) {
    console.log(error);
  }

});


//post method for search
router.post('/search', async (req, res) => {


  try {
    const locals = {
        title: "Search",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    let  searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
    const data = await Post.find({
        $or: [
            {  title: {$regex: new RegExp(searchNoSpecialChar, 'i')}},
            {  body: {$regex: new RegExp(searchNoSpecialChar, 'i')}}
        ]
    });
    res.render("search", {
        data,
        locals,
        currentRoute: '/search'
    });
  } catch (error) {
    console.log(error);
  }

});


router.get('/about',(req,res) => {    // this is how to add new routes
    res.render('about', {
      currentRoute: '/about'
    });
    
});

module.exports = router;


//routes can be splitup into controlleres
