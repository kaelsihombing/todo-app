const chai = require('chai');
const chaiHttp = require('chai-http');
const {
    expect,
} = chai;

chai.use(chaiHttp);
const server = require('../index.js');

const User = require('../models/user.js');
const Task = require('../models/task.js');

const userFixtures = require('../fixtures/userFixtures.js');
const userSample = userFixtures.create();
const taskFixtures = require('../fixtures/taskFixtures.js');

describe('TASK API UNIT TESTING', () => {
    before(function () {
        Task.deleteMany({}, function () { });
        User.deleteMany({}, function () { });
        User.register({
            fullname: userSample.fullname,
            email: userSample.email,
            password: userSample.password,
            password_confirmation: userSample.password,
        })
    })

    after(function () {
        Task.deleteMany({}, function () { });
        User.deleteMany({}, function () { });
    })

    context('POST /api/v1/tasks/create', () => {
        it('Should create a new task for an authorized user', function () {
            let taskSample = taskFixtures.create();
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    chai.request(server)
                        .post('/api/v1/tasks/create')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end(function (err, res) {
                            expect(res.status).to.equal(201);
                            expect(res.body).to.be.an('object');
                            expect(res.body).to.have.property('success');
                            expect(res.body).to.have.property('data');
                            let { success, data } = res.body;
                            expect(success).to.eq(true);
                            expect(data).to.be.an('object');
                        });
                })
        })

        it('Should not create a new task due to invalid token', function () {
            let taskSample = taskFixtures.create();
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    res.body.data.token = 'invalidtoken'
                    chai.request(server)
                        .post('/api/v1/tasks/create')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end(function (err, res) {
                            expect(res.status).to.equal(401);
                            let { success, data } = res.body;
                            expect(success).to.eq(false);
                        });
                })
        })

        it('Should not create a new task due to missing task title', function () {
            let taskSample = taskFixtures.create();
            delete taskSample.title;
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    chai.request(server)
                        .post('/api/v1/tasks/create')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end(function (err, res) {
                            expect(res.status).to.equal(422);
                            let { success, error } = res.body;
                            expect(success).to.eq(false);
                            expect(error.message).to.eq('Validation failed: title: Path `title` is required.')
                        });
                })
        })

        it('Should not create a new task due to missing task dueDate', function () {
            let taskSample = taskFixtures.create();
            delete taskSample.dueDate;
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    chai.request(server)
                        .post('/api/v1/tasks/create')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end(function (err, res) {
                            expect(res.status).to.equal(422);
                            let { success, error } = res.body;
                            expect(success).to.eq(false);
                            expect(error.message).to.eq('Validation failed: dueDate: Path `dueDate` is required.');
                        });
                })
        })

        it('Should not create a new task due to missing  task title and dueDate', function () {
            let taskSample = taskFixtures.create();
            delete taskSample.title;
            delete taskSample.dueDate;
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    chai.request(server)
                        .post('/api/v1/tasks/create')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end(function (err, res) {
                            expect(res.status).to.equal(422);
                            let { success, error } = res.body;
                            expect(success).to.eq(false);
                            expect(error.message).to.eq('Validation failed: title: Path `title` is required., dueDate: Path `dueDate` is required.');
                        });
                })
        })
    })

    context('GET /api/v1/tasks/view', () => {
        it('Should show tasks for current user', function () {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    chai.request(server)
                        .get('/api/v1/tasks/view')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .end(function (err, res) {
                            console.log(res.body)
                            expect(res.status).to.equal(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body).to.have.property('success');
                            expect(res.body).to.have.property('data');
                            let { success, data } = res.body;
                            expect(success).to.eq(true);
                        });
                })
        })

        it('Should not show tasks for current user due to invalid token', function () {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    res.body.data.token = 'invalidtoken'
                    chai.request(server)
                        .get('/api/v1/tasks/view')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .end(function (err, res) {
                            expect(res.status).to.equal(401);
                            let { success, data } = res.body;
                            expect(success).to.eq(false);
                        });
                })
        })
    })

    // context('PUT /api/v1/tasks/edit', () => {
    //     it('Should update a selected task for current user', function () {
    //         const taskSample = taskFixtures.create();
    //         chai.request(server)
    //             .post('/api/v1/auth/login')
    //             .set('Content-Type', 'application/json')
    //             .send(JSON.stringify(userSample))
    //             .end((err, res) => {
    //                 chai.request(server)
    //                     .put('/api/v1/tasks/edit')
    //                     .set('Content-Type', 'application/json')
    //                     .set('Authorization', res.body.data.token)
    //                     .query({id: })
    //                     .send(JSON.stringify(taskSample))
    //                     .end(function (err, res) {
    //                         console.log(res.body)
    //                         expect(res.status).to.equal(200);
    //                         expect(res.body).to.be.an('object');
    //                         expect(res.body).to.have.property('success');
    //                         expect(res.body).to.have.property('data');
    //                         let { success, data } = res.body;
    //                         expect(success).to.eq(true);
    //                     });
                    
    //             })
    //     })
    // })
})
