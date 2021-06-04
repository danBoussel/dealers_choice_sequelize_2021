const Sequelize = require('sequelize');
const dbConn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/dealers_choice_sequelize')

const { DataTypes: { DATE, STRING, UUID, UUIDV4 } } = Sequelize;


const members = [
    'james smith',
    'amelia miller',
    'mia davis',
    'oliver william',
    'ava martinez',
    'henry johnson',
    'evelyn brown'
];

const gyms = [
    'gold gym of media',
    'gold gym of wildwood',
    'gold gym of cherry hill'
];

const Member = dbConn.define('member', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name: {
        type: STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
});

Member.belongsTo(Member, { as: 'trainer' })
Member.hasMany(Member, { as: 'customer', foreignKey: 'trainerId' })

Member.trainersWithMembers = function() {
    return this.findAll({
        where: {
            trainerId: null

        },
        include: [
            { model: Member, as: 'customer' }
        ]
    });
}


const Gym = dbConn.define('gym', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    name: {
        type: STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    }
});



const Booking = dbConn.define('booking', {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
    },
    booking_date_time: {
        type: DATE,
        allowNull: false,
        defaultValue: function() {
            return new Date(new Date(+new Date(2021, 6, 5) + Math.random() * (new Date(2022, 6, 5) - new Date(2021, 6, 5))).setHours(6 + Math.random() * (21 - 6) | 0))
        }
    }
});

Booking.belongsTo(Member);
Booking.belongsTo(Gym);



const syncAndSeed = async() => {
    await dbConn.sync({ force: true })

    const [
        james_smith,
        amelia_miller,
        mia_davis,
        oliver_william,
        ava_martinez,
        henry_johnson,
        evelyn_brown
    ] = await Promise.all(members.map(name => Member.create({ name })));



    mia_davis.trainerId = james_smith.id;
    oliver_william.trainerId = james_smith.id;
    ava_martinez.trainerId = amelia_miller.id;
    henry_johnson.trainerId = amelia_miller.id;
    evelyn_brown.trainerId = james_smith.id
    await Promise.all([mia_davis.save(), oliver_william.save(), ava_martinez.save(), henry_johnson.save(), evelyn_brown.save()]);

    const [gold_gym_of_media,
        gold_gym_of_wildwood,
        gold_gym_of_cherry_hill
    ] = await Promise.all(gyms.map(name => Gym.create({ name })));

    await Promise.all([
        Booking.create({ memberId: james_smith.id, gymId: gold_gym_of_cherry_hill.id }),
        Booking.create({ memberId: amelia_miller.id, gymId: gold_gym_of_media.id }),
        Booking.create({ memberId: james_smith.id, gymId: gold_gym_of_wildwood.id }),
    ]);

}






module.exports = {
    syncAndSeed,
    models: {
        Member,
        Gym,
        Booking
    }


}