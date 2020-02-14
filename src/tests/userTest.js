const chai = require('chai');
const chaiHttp = require('chai-http');
const {
    should,
    expect
} = chai;

chai.use(chaiHttp);
const server = require('../index');

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const user = {
    fullname:'Orang test',
    email: 'test01@mail.com',
    password: '123456',
    password_confirmation: '123456'
}

describe('~USER API UNIT TESTING~', () => {
    before(function () {
        User.deleteMany({}, function() {})
        User.create({
            ...user,
            encrypted_password: bcrypt.hashSync(user.password)
            // }).then(i => done());
        })
    })

    after(function () {
        User.deleteMany({}, function() {})
        // .then(() => done());
    })

    context('POST /api/v1/users/register', () => {
        it('Should create new user', function () {
            let data = {
                ...user,
                email: 'test02@mail.com'
            }

            chai.request(server)
                .post('/api/v1/users/register')
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
                fullname:'Orang test',
                email: 'test01@mail.com',
                password: '123456',
                password_confirmation: '12345'
            }

            chai.request(server)
                .post('/api/v1/users/register')
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
                    expect(error).to.eq('Password doesn\'t match');
                })
        })

        it('Should not create a new user because duplication data', function () {
            let data = {
                fullname:'Orang test',
                email: 'test01@mail.com',
                password: '123456',
                password_confirmation: '123456'
            }

            chai.request(server)
                .post('/api/v1/users/register')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    // console.log(res.body);
                    expect(res.status).to.eq(422);
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('error');
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('object');
                    expect(error.errmsg).to.eq('E11000 duplicate key error collection: awesome-project_test.users index: email_1 dup key: { : "test01@mail.com" }')

                })
        })

        it('Should not create a new user due to validation error', function () {
            let data = {
                fullname:'Orang test',
                password: '123456',
                password_confirmation: '123456'
            }

            chai.request(server)
                .post('/api/v1/users/register')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    // console.log(res.body);
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

    context('POST /api/v1/users/login', () => {
        it('Should successfully logged in', function () {
            chai.request(server)
                .post('/api/v1/users/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(user))
                .end(function (err, res) {
                    // console.log(res.body);
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
                    // expect(data.token).to.eq(decoded)

                })
        })

        it('Should not successfully logged in because the password is wrong', function () {
            let data = {
                email: 'test01@mail.com',
                password: 'test123',
            }
            chai.request(server)
                .post('/api/v1/users/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    // console.log(res.body);
                    expect(res.status).to.eq(422)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('error');
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('string');
                    expect(error).to.eq('Password is wrong');

                    // expect(data.token).to.eq(decoded)

                })
        })

        it('Should not successfully logged in because email doesn\'t exist', function () {
            let data = {
                email: 'test03@mail.com',
                password: '123456',
            }
            chai.request(server)
                .post('/api/v1/users/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    // console.log(res.body);
                    expect(res.status).to.eq(422)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('success');
                    expect(res.body).to.have.property('error');
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('string');
                    expect(error).to.eq('Email doesn\'t exist');

                    // expect(data.token).to.eq(decoded)

                })
        })
    })
})