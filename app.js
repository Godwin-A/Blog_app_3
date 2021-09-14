var express = require('express')
var app = express()
var method = require('method-override')
var Comment = require('./models/comment')
var passport = require('passport')
LocalStrategy = require('passport-local')
var flash = require('connect-flash')
var marked = require('marked')
User = require('./models/user')
var slugify= require('slugify')
var blog = require('./models/blog.js')
var bodyParser = require('body-parser')
var mongoose= require('mongoose')
mongoose.connect('mongodb://localhost/Myblog')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(method('_method'))
app.use(flash())

//--passport config--
app.use(require('express-session')({
  secret: 'be better',
  resave: false,
  saveUninitialized : false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(function (req, res, next){
     res.locals.currentUser = req.user
     res.locals.error = req.flash('error')
     res.locals.success = req.flash('success')
     next()
})

app.get('/', function(req, res){
  res.render('landing')
})
app.get('/blogs', function(req, res){
  blog.find({}, function(error, blogs){
    if(error){
      res.send('couldn`t find any Blog')
    }else{
       res.render('index', {blogs:blogs, currentUser: req.user})
    }
  })

})
app.get('/blogs/new',logger, function(req, res){
  res.render('new')
})
app.post('/blogs',logger, (req, res)=>{
  var title = req.body.title
  var image = req.body.image
  var description = req.body.description
  var author = {
    id: req.user._id,
    username : req.user.username
  }
 
  var newBlog = {title : title , image: image, description: description, author: author}
   console.log(req.user)
    blog.create(newBlog, function(error, createdBlog){
      if(error){
        res.redirect('/blogs/new')
      }else{
        res.redirect('/blogs')
      }
    })
})
app.get('/blogs/:id', function(req, res) {
  blog.findById(req.params.id).populate('comments').exec(function(error, found){
    if(error){
    res.redirect('/blogs')
    console.log(err)
    }else{
       res.render('show', {blog: found})
    }
  })
})
app.get('/blogs/:id/edit',check, function(req, res){
   blog.findById(req.params.id, function(err, blog){
         res.render('edit', {blog:blog})
    })
})
app.delete('/blogs/:id',check, function(req, res){
  blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect('show')
    }else{
      res.redirect('/')
    }
  })
})
 app.put('/blogs/:id', function (req, res) {
    blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, data) {
      if(err){
        res.redirect('/')
      }else{
        res.redirect('/blogs')
      }
    })
 })
 //--------comments routes--

 app.get('/blogs/:id/comments/new',logger, function(req, res){
   blog.findById(req.params.id, function (err, blog) {
     if(err){
       console.log(err)
     }else{
       res.render('newc',{blog:blog})
     }
     
   })
   
 })

app.post('/blogs/:id/comments',logger, function(req, res){
 blog.findById(req.params.id, function(err, blog){
   if(err){
     console.log(err)
     redirect('/blogs')
   }else{
   Comment.create(req.body.comment, function (err, comment) {
     if(err){
      req.flash('error', 'something went wrong')
       console.log(err)
     }else{
       comment.author.id = req.user._id
       comment.author.username = req.user.username
       comment.save()
       blog.comments.push(comment)
       blog.save()
       req.flash('success', 'Sucessfully added comment')
       res.redirect('/blogs/' + blog._id)
     }
   })
   }
 })

})
   //---auth routes--


   app.get('/register', function(req, res){
     res.render('register')
   })
  
    app.post('/register', ( req, res)=>{
      var newUser = new User({username: req.body.username})
      User.register(newUser, req.body.password, function(err, user){
        if(err){
          console.log(err)
          req.flash('error', err.message)
          return res.render('register')
        }else{
          passport.authenticate('local')(req, res, function(){
            req.flash('success', 'Welcome ' + user.username)
            res.redirect('/blogs')
          })
        }
      })
    })

    //---login form 

    app.get('/login', function(req, res){
      res.render('login')
    })
    app.post('/login', passport.authenticate('local', {
      successRedirect : '/blogs',
      failureRedirect: '/login'
    }), (req, res)=>{ 
    })

    app.get('/logout', function(req, res){
      req.logout()
      req.flash('success', 'Logged You Out')
      res.redirect('/blogs')
    })

    function logger(req, res, next) {
      if(req. isAuthenticated()){
        return next()
      }
      req.flash('error', 'YoU need To Be Logged In To Do That')
      res.redirect('/login')
    }


    function check(req, res, next){
      if(req.isAuthenticated()){

        blog.findById(req.params.id, function(err, blog){
            if(err){
              req.flash('error', 'Campground Not Found')
              res.redirect('back')
            }else{
              if(blog.author.id.equals(req.user._id) ){
                next()
              }else{
                req.flash('error', 'You dont have permission to do that')
                res.redirect('back')
              }
            }
          } )
          }else{
            req.flash('error', 'You need to be logged in to do that')
            res.redirect('back')
          } 
      
    }
app.listen(3000, function(){
  console.log('Server is Running')
})

