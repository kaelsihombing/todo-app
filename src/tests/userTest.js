const chai = require('chai');
const chaiHttp = require('chai-http');
const {
    expect
} = chai;

chai.use(chaiHttp);
const server = require('../index');

const Task = require('../models/task.js');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const user = {
    fullname: 'Orang test',
    email: 'test00@mail.com',
    password: '123456',
    password_confirmation: '123456'
}

describe('~USER API UNIT TESTING~', function () {
    before(function () {
        User.create({
            ...user,
            encrypted_password: bcrypt.hashSync(user.password, 10),
        })
    })

    after(function () {
        // Task.deleteMany({}, () => { })
        User.deleteMany({}, () => { })
    })

    //===================REGISTER====================
    context('POST /api/v1/users', function () {
        it('Should create new user', function () {
            let data = {
                ...user,
                email: "test01@gmail.com"
            }

            chai.request(server)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.equal(201);
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('data');
                    let { success, data } = res.body;
                    expect(success).to.eq(true);
                    expect(data).to.be.an('object');
                    expect(data).to.have.property('id')
                    expect(data).to.have.property('fullname')
                    expect(data).to.have.property('email')

                })
        })

        it('password and password_confirmation doesn\'t match', function () {
            let data = {
                fullname: 'Orang test',
                email: 'test02@mail.com',
                password: '123456',
                password_confirmation: '1234'
            }

            chai.request(server)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.eq(422);
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('error');
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('string');
                    expect(error).to.eq('Password and Password Confirmation doesn\'t match');

                })
        })

        it('Should not create a new user because duplication data', function () {
            let data = {
                fullname: 'Orang test',
                email: 'test00@mail.com',
                password: '123456',
                password_confirmation: '123456'
            }

            chai.request(server)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.eq(422);
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('error');
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('object');
                    expect(error.message).to.eq('E11000 duplicate key error collection: awesome-project_test.users index: email_1 dup key: { : "test00@mail.com" }')

                })
        })

        it('Should not create a new user due to validation error', function () {
            let data = {
                fullname: 'Orang test',
                password: '123456',
                password_confirmation: '123456'
            }

            chai.request(server)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.eq(422);
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('error');
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('object');
                    expect(error.message).to.eq('Validation failed: email: Path `email` is required.')

                })
        })
    })

    context('POST /api/v1/auth/login', function () {
        it('Should successfully logged in', function () {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(user))
                .end(function (err, res) {
                    expect(res.status).to.eq(200)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('data');
                    let { success, data } = res.body;
                    expect(success).to.eq(true);
                    expect(data).to.be.an('object')
                    expect(data).to.have.property('id')
                    expect(data).to.have.property('email')
                    expect(data).to.have.property('token')

                })
        })

        it('Should not successfully logged in because the password is wrong', function () {
            let data = {
                email: 'test00@mail.com',
                password: 'test123',
            }
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('error');
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('string');
                    // expect(error).to.eq('Email or Password is wrong');

                })
        })

        it('Should not successfully logged in because email doesn\'t exist', function () {
            let data = {
                email: 'test03@mail.com',
                password: '123456',
            }
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('error');
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('string');
                    // expect(error).to.eq('Email doesn\'t exist');

                })
        })
    })

    // context('POST /api/v1/users/update', () => {
    //     it('Should successfully update user data', function () {
    //         let user = {
    //             email: 'test00@mail.com',
    //             password: '123456',
    //         }
    //         chai.request(server)
    //             .post('/api/v1/auth/login')
    //             .set('Content-Type', 'application/json')
    //             .send(JSON.stringify(user))
    //             .end((err, res) => {
    //                 console.log(res.body)
    //                 let update = {
    //                     fullname: "mike sihombing",
    //                     email: "testUpdate@gmail.com",
    //                 }
    //                 chai.request(server)
    //                     .put('/api/v1/users')
    //                     .type('form')
    //                     .set('Content-Type', 'application/json')
    //                     .set('Authorization', res.body.data.token)
    //                     .send(JSON.stringify(update))
    //                     .end(function (err, res) {
    //                         console.log('haii')
    //                         expect(res.status).to.equal(201);
    //                         // expect(res.body).to.be.an('object')
    //                         // expect(res.body).to.have.property('success');
    //                         // expect(res.body).to.have.property('data');
    //                         // let { success, data } = res.body;
    //                         // expect(success).to.eq(true);
    //                         // expect(data).to.be.an('object');
    //                         // expect(data).to.have.property('id')
    //                         // expect(data).to.have.property('fullname')
    //                         // expect(data).to.have.property('email')
    //                     })

    //             })
    //     })
    // })
})