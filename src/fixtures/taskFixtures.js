const faker = require('faker');

function create() {
    return{
            title: faker.lorem.sentence(),
            dueDate: faker.date.future(), 
    }
}

module.exports = {
    create,
}