var mongoose = require('mongoose')
var blogSchema = new mongoose.Schema({
  title : String,
  image : String,
  description : String,
  created: { type: Date, default: new Date() }
}) 
var blog = mongoose.model('blog', blogSchema)

module.exports= mongoose.model('blog', blogSchema)



