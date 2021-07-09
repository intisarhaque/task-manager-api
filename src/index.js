const express = require('express')
require('./db/mongoose')

const app = express()
const port = process.env.PORT 
const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')



app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () =>{
    console.log("Server is up on port "+ port)
})




//C:\Users\arsen\Documents\mongodb-win32-x86_64-windows-4.4.6\bin\mongod.exe --dbpath=C:/Users/arsen/Documents/mongodb-data  
//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
