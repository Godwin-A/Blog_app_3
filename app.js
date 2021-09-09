var express = require('express')
var app = express()
var method = require('method-override')
var marked = require('marked')
var slugify= require('slugify')
var blog = require('./models/blog.js')
var bodyParser = require('body-parser')
var mongoose= require('mongoose')
mongoose.connect('mongodb://localhost/Myblog')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(method('_method'))

app.get('/', function(req, res){
  res.redirect('/blogs')
})
app.get('/blogs', function(req, res){
  blog.find({}, function(error, blogs){
    if(error){
      res.send('couldn`t find any Blog')
    }else{
       res.render('index', {blogs:blogs})
    }
  })

})
app.get('/blogs/new', function(req, res){
  res.render('new')
})
app.post('/blogs', (req, res)=>{
    blog.create(req.body.blog, function(error, createdBlog){
      if(error){
        res.redirect('/blogs/new')
      }else{
        res.redirect('/blogs')
      }
    })
})
app.get('/blogs/:id', function(req, res) {
  blog.findById(req.params.id, function(error, found){
    if(error){
    res.redirect('/blogs')
    }else{
       res.render('show', {blog: found})
    }
  })
})
app.get('/blogs/:id/edit', function(req, res){
  blog.findById(req.params.id, function(err, blog){
    if(err){
      res.redirect('/')
      console.log('cannot edit blog')
    }else{
      res.render('edit', {blog:blog})
    }
  } )
})
app.delete('/blog/:id', function(req, res){
  blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect('show')
    }else{
      res.redirect('/')
    }
  })
})
 app.put('/blog/:id', function (req, res) {
    blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, data) {
      if(err){
        res.redirect('/')
      }else{
        res.redirect('/blogs')
      }
    })
 })




app.listen(3000, function(){
  console.log('Server is Running')
})