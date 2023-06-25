const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt'); //to decrypt the password
const jwt = require('jsonwebtoken');

//global context 
const adminLayout = '../views/layouts/admin'
//jwt secret
const jwtSecret = process.env.JWT_SECRET;

//check login
//middleware function
const authMiddleware = (req, res, next ) =>{
  const token = req.cookies.token;

  if(!token){
    return res.status(401).json({message: 'Unauthorized'});
  }

  try{
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  }catch(error){
    return res.status(401).json({message: 'Unauthorized'});
  }
}




// get method
//admin login page 

router.get('/admin', async (req, res) => {

  try {
    const locals = {
        title: "Admin",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
    }
    
    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }

});


// post method
//admin check login  
router.post('/admin', async (req, res) => {

  try {
    const { username, password  } = req.body;

    const user = await User.findOne({username});

    if(!user){
      return res.status(401).json({ message:'Invalid credentials'});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
      return res.status(401).json({ message:'Invalid credentials'});
    }

    const token = jwt.sign({userId: user._id}, jwtSecret);
    res.cookie('token', token, { httpOnly: true});
    res.redirect('/dashboard');
    // console.log(req.body);

    // res.redirect('/admin');
  } catch (error) {
    console.log(error);
  }
});




// get method
//admin dashboard  
router.get('/dashboard', authMiddleware, async (req, res) => {


  try {
    const locals = {
      title: "Admin/dashboard",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    const data = await Post.find();
    res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }
});




// post method
//admin Register 
router.post('/register', async (req, res) => {

  try {
    const { username, password  } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password:hashedPassword });
      res.status(201).json({message: 'User Created', user});
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }
    // res.redirect('/admin');
  } catch (error) {
    console.log(error);
  }
});





// geet method
//admin create new post 
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    const data = await Post.find();
    res.render('admin/add-post', {
        locals,
        layout: adminLayout
 
    });
  } catch (error) {
    console.log(error);
  }
});

// post method
//admin create new post 
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });
      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});




// get method
//admin edit the post 
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",

    };
    const data = await Post.findOne({_id: req.params.id});


    res.render('admin/edit-post', {
      data,
      locals,
      layout: adminLayout
    })


  } catch (error) {
    console.log(error);
  }
});





// put method
//admin edit the post 
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);


  } catch (error) {
    console.log(error);
  }
});

// delete method
//admin delete the post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  
  try {
    await Post.deleteOne( {_id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);    
  }
});

// get method
//admin logout
router.get('/logout', async (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});





module.exports = router;
