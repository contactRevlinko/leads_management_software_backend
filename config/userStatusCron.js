const cron = require("node-cron")
const User = require("../models/user")


const userStatusCron = () => {
    cron.schedule("0 0 * * * " , async( ) => {
      try{
      console.log("Running User Status Cron....")
      const inActiveUsers = await User.find({
        isActive : false , 
        
      })
      console.log(`inactive Users Found ${inActiveUsers.length}`)
      }
      catch (err) {
      console.log("Cron Error:", err.message);
    }

    })
}
module.exports = userStatusCron;