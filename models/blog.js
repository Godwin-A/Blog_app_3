var mongoose = require('mongoose')
var blogSchema = new mongoose.Schema({
  title : String,
  image : String,
  description : String,
  created: { type: Date, default: new Date() },
  author : {
    id : {
      type: mongoose.Schema.Types.ObjectId,
      ref : 'User'
    },
    username : String
  },
  comments : [{
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}) 
var blog = mongoose.model('blog', blogSchema)

module.exports= mongoose.model('blog', blogSchema)



