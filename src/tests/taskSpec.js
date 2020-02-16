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
    before(() => {
        userSample.password_confirmation = userSample.password
        User.register(userSample)
    })

    after(() => {
        User.deleteMany({}, function () { })
    })

    context('POST /api/v1/tasks', () => {
        it('Should create a new task for an authorized user', () => {
            let taskSample = taskFixtures.create();
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    chai.request(server)
                        .post('/api/v1/tasks')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end((err, res) => {
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

        it('Should not create a new task due to invalid token', () => {
            let taskSample = taskFixtures.create();
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    res.body.data.token = 'invalidtoken'
                    chai.request(server)
                        .post('/api/v1/tasks')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end((err, res) => {
                            expect(res.status).to.equal(401);
                            let { success, data } = res.body;
                            expect(success).to.eq(false);
                        });
                })
        })

        it('Should not create a new task due to missing missing required information', () => {
            let taskSample = taskFixtures.create();
            delete taskSample.title;
            delete taskSample.dueDate;
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    chai.request(server)
                        .post('/api/v1/tasks')
                        .set('Content-Type', 'application/json')
                        .set('Authorization', res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end((err, res) => {
                            expect(res.status).to.equal(422);
                            let { success, error } = res.body;
                            expect(success).to.eq(false);
                            expect(error.message).to.eq('Validation failed: title: Path `title` is required., dueDate: Path `dueDate` is required.');
                        });
                })
        })
    })

    context('GET /api/v1/tasks/:page', () => {
        it('Should show tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    chai.request(server)
                        .get('/api/v1/tasks/1')
                        .set('Authorization', res.body.data.token)
                        .end((err, res) => {
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
                    res.body.data.token = 'invalidToken'
                    chai.request(server)
                        .get('/api/v1/tasks/1')
                        .set('Authorization', res.body.data.token)
                        .end((err, res) => {
                            expect(res.status).to.equal(401);
                            let { success, data } = res.body;
                            expect(success).to.eq(false);
                        });
                })
        })
    })

    context('PUT /api/v1/tasks/:id', () => {
        it('Should update a selected task for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasksall')
                        .set('Authorization', res.body.data.token)
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.length - 1))
                            let taskSample = taskFixtures.create()
                            chai.request(server)
                                .put(`/api/v1/tasks/${res.body.data[i]._id}`)
                                .set('Content-Type', 'application/json')
                                .set('Authorization', token)
                                .send(JSON.stringify(taskSample))
                                .end((err, res) => {
                                    expect(res.status).to.equal(201);
                                    expect(res.body).to.be.an('object');
                                    expect(res.body).to.have.property('success');
                                    expect(res.body).to.have.property('data');
                                    let { success, data } = res.body;
                                    expect(success).to.eq(true);
                                });
                        })
                })
        })

        it('Should not update a selected task due to invalid task id', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasksall')
                        .set('Authorization', res.body.data.token)
                        .end((err, res) => {
                            let taskSample = taskFixtures.create()
                            chai.request(server)
                                .put('/api/v1/tasks/randomId')
                                .set('Content-Type', 'application/json')
                                .set('Authorization', token)
                                .send(JSON.stringify(taskSample))
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })
                })
        })
    })

    context('DELETE /api/v1/tasks/:id', () => {
        it('Should not delete a task due to invalid task id', function () {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasksall')
                        .set('Authorization', res.body.data.token)
                        .end((err, res) => {
                            chai.request(server)
                                .delete('/api/v1/tasks/randomId')
                                .set('Authorization', token)
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error.message).to.eq('Cast to ObjectId failed for value "randomId" at path "_id" for model "Task"');
                                });
                        })
                })
        })

        it('Should delete a task for current user', function () {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasksall')
                        .set('Authorization', res.body.data.token)
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.length - 1));
                            chai.request(server)
                                .delete(`/api/v1/tasks/${res.body.data[i]._id}`)
                                .set('Authorization', token)
                                .end((err, res) => {
                                    expect(res.status).to.equal(200);
                                    expect(res.body).to.be.an('object');
                                    expect(res.body).to.have.property('success');
                                    expect(res.body).to.have.property('data');
                                    let { success, data } = res.body;
                                    expect(success).to.eq(true);
                                });
                        })
                })
        })
    })
})