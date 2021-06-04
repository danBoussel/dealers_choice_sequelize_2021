const express = require('express');
const app = express()
const path = require('path')
const { syncAndSeed, models: { Member, Gym, Booking } } = require('./db')
app.use('/assets', express.static(path.join(__dirname, 'assets')));


app.get('/api/member', async(req, res, next) => {
            try {
                // const trainers = await Member.findAll({
                //     include: [
                //         { model: Member, as: 'trainer' },
                //         { model: Member, as: 'customer' }
                //     ]
                //})
                const trainers = await Member.trainersWithMembers()
                res.send(
                        `
                <html>
                    <head>
                    <title>Dealer Choice Sequelize</title>
                    <link rel='stylesheet' href='/assets/styles.css'/>
                    </head>
                    <body>
                    <h1>Trainers and Members</h1>
                    <h4>Check <a href='/api/booking'>Bookings</a></h4>
                    <ul class='outer'>
                    ${
                        trainers.map(el=>{

                            return `
                           
                            <h3>Trainer</h3>
                           <li>${el.name}
                           <h5>members:</h5>
                           <ul class='inner'>
                           ${el.customer.map(mem=>{

                              return `
                              <li>${mem.name}</li>`
                           }).join('')}
                           </ul>
                           </li>
                          
                            `
                        }).join('')
                    }
                    </ul>
                   </body>
             </html>

                    `
        )
    } catch (ex) {
        next(ex)
    }
})


app.get('/api/booking', async(req, res, next) => {
    try {
        const trainersbookings = await Booking.findAll({
            include: [ Member ,Gym ]
        });
    
        res.send(

                `

                <html>
            <head>
            <title>Dealer Choice Sequelize</title>
            <link rel='stylesheet' href='/assets/styles.css'/>
            </head>
            <body>
            <h1 id='bookings_route_h1'>Bookings</h1>
            <h4 id='members_link'>Back to <a href='/api/member'>Trainers and Members</a></h4>
   
<div class='bookings'>
${trainersbookings.map((book)=>{
    return `
    
    <div class='booking'>
    <h3>Booking</h3>
    <p>Location</p> ${book.gym.name}
    <p>Trainer</p> ${book.member.name}
    <p> Booking Time</p> ${book.booking_date_time.toLocaleString('en-US').replace(/:\d{2}\s/,' ')
}
    </div>
    `
}).join('')}


</div>
            `

)
} catch (ex) {
next(ex)
}
})





const init = async() => {
    try {
        await syncAndSeed()
        const port = process.env.PORT || 3000;
        app.listen(port, () => console.log(`PORT ${port}`))
    } catch (ex) {
        console.log(ex)
    }
}
init()