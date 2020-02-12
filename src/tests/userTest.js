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
    email: 'test01@mail.com',
    password: '123456',
    password_confirmation: '123456'
}

describe('User API', () => {

    before(done => {
        User.create({
            ...user,
            encrypted_password: bcrypt.hashSync(user.password)
        }).then(i => done());
    })

    after(done => {
        User.deleteMany({})
            .then(() => done());
    })

    context('POST /api/v1/users/register', () => {
        it('Should create new user', done => {
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
                    let { success, data } = res.body;
                    expect(success).to.eq(true);
                    expect(data).to.be.an('object');
                    expect(data).to.have.property('id')
                    expect(data).to.have.property('email')
                    expect(data.email).to.eq(data.email)

                    done();
                })
        })

        it('password and password_confirmation doesn\'t match', done => {
            let data = {
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
                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('string');
                    expect(error).to.eq('Password doesn\'t match');
                    done();
                })
        })

        it('Should not create a new user due to duplication', done => {
            let data = {
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

                    let { success, error } = res.body;
                    expect(success).to.eq(false);
                    expect(error).to.be.an('object');
                    expect(error.errmsg).to.eq('E11000 duplicate key error collection: awesome-project_test.users index: email_1 dup key: { : "test01@mail.com" }')
                    done();
                })
        })
    })

    context('POST /api/v1/users/login', () => {
        it('Should successfully logged in', done => {
            chai.request(server)
                .post('/api/v1/users/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(user))
                .end(function (err, res) {
                    console.log(res.body);
                    expect(res.status).to.eq(200)
                    let { success, data } = res.body;
                    expect(success).to.eq(true);
                    expect(data).to.be.an('object')
                    expect(data).to.have.property('id')
                    expect(data).to.have.property('email')
                    expect(data).to.have.property('token')
                    // expect(data.token).to.eq(decoded)
                    done();
                })
        })
    })
})
