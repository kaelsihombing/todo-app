const faker = require('faker');

function create() {
    return{
            title: faker.lorem.sentence(),
            dueDate: faker.date.future(),
            importanceLevel: faker.random.number({'min': 1, 'max': 3}),
            completion: (Math.random() >= 0.5),
    }
}

module.exports = {
    create,
}