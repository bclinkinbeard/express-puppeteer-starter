const express = require('express')
const port = process.env.PORT || 3000
const app = express()

app.get('/', (req, res) => res.redirect('/images/png'))

app.use('/images', require('./routes/images'))

app.listen(port, function() {
  console.log('Server listening at http://localhost:' + port)
})
