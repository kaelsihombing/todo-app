const faker = require('faker');

function create() {
    return{
            title: faker.lorem.sentence(),
            dueDate: faker.date.future(),
            importanceLevel: faker.random.number({'min': 1, 'max': 3}),
            completion: faker.random.boolean(),
    }
}

module.exports = {
    create,
}