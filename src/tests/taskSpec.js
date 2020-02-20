const chai = require('chai');
const chaiHttp = require('chai-http');
const {
    expect,
} = chai;

chai.use(chaiHttp);
const server = require('../index.js');

const faker = require('faker')

const User = require('../models/user.js');
const Task = require('../models/task.js');

const userFixtures = require('../fixtures/userFixtures.js');
const userSample = userFixtures.create();
const userSample2 = userFixtures.create();
const taskFixtures = require('../fixtures/taskFixtures.js');


describe('TASK API UNIT TESTING', () => {
    before(() => {
        User.deleteMany({}, () => { })
        Task.deleteMany({}, () => { })
        userSample.password_confirmation = userSample.password
        User.register(userSample)
        userSample2.password_confirmation = userSample2.password
        User.register(userSample2)

        for (let i = 0; i < 2; i++) {
            let taskSample = taskFixtures.create();
            taskSample.importanceLevel = 1
            taskSample.completion = true
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
                        .end((err, res) => { })
                })
        }

        for (let i = 0; i < 2; i++) {
            let taskSample = taskFixtures.create();
            taskSample.importanceLevel = 2
            taskSample.completion = false
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
                        .end((err, res) => { })
                })
        }

        for (let i = 0; i < 2; i++) {
            let taskSample = taskFixtures.create();
            taskSample.importanceLevel = 3
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
                        .end((err, res) => { })
                })
        }
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
                        .set('Authorization', 'Bearer ' + res.body.data.token)
                        .send(JSON.stringify(taskSample))
                        .end((err, res) => {
                            expect(res.status).to.equal(401);
                            let { success, data } = res.body;
                            expect(success).to.eq(false);
                        });
                })
        })

        it('Should not create a new task due to missing required information', () => {
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
                        .set('Authorization', 'Bearer '+res.body.data.token)
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

    context('GET /api/v1/tasks', () => {
        it('Should show tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ page: page })
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

        it('Should not show tasks for current user due to invalid page', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            chai.request(server)
                                .get(`/api/v1/tasks`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, data } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })

                })
        })
    })

    context('GET /api/v1//tasks/sort/asc', () => {
        it('Should show ascending sorted tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let sortParam = ['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion']
                            let randomParam = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/asc`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomParam, page: page })
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

        it('Should not show ascending sorted tasks for current user due to invalid sorting parameter', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let randomParam = 'randomParam'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/asc`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomParam, page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid sorting parameter!')
                                });
                        })
                })
        })

        it('Should not show ascending sorted tasks for current user due to invalid page', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let sortParam = ['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion']
                            let randomParam = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            page = page.toString()
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/asc`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomParam, page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })
                })
        })
    })

    context('GET /api/v1//tasks/sort/desc', () => {
        it('Should show descending sorted tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let sortParam = ['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion']
                            let randomParam = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/desc`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomParam, page: page })
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

        it('Should not show descending sorted tasks for current user due to invalid sorting parameter', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .query({ page: 1, pagination: false })
                        .set('Authorization', 'Bearer ' + token)
                        .end((err, res) => {
                            let randomParam = 'randomParam'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/desc`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomParam, page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid sorting parameter!')
                                });
                        })
                })
        })

        it('Should not show descending sorted tasks for current user due to invalid page', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let sortParam = ['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion']
                            let randomParam = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            page = page.toString()
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/desc`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomParam, page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })
                })
        })
    })

    context('PUT /api/v1/tasks', () => {
        it('Should update a selected task for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.docs.length - 1))
                            let taskSample = taskFixtures.create()
                            let id = res.body.data.docs[i]._id
                            chai.request(server)
                                .put(`/api/v1/tasks`)
                                .set('Content-Type', 'application/json')
                                .set('Authorization', token)
                                .query({ id: id })
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

        it('Should not update a selected task for current user due to invalid dueDate', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.docs.length - 1))
                            let taskSample = taskFixtures.create()
                            taskSample.dueDate = faker.date.past()
                            let id = res.body.data.docs[i]._id
                            chai.request(server)
                                .put(`/api/v1/tasks`)
                                .set('Content-Type', 'application/json')
                                .set('Authorization', token)
                                .query({ id: id })
                                .send(JSON.stringify(taskSample))
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, data } = res.body;
                                    expect(success).to.eq(false);
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
                        .get('/api/v1/tasks')
                        .set('Authorization', token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let taskSample = taskFixtures.create()
                            let id = 'randomId'
                            chai.request(server)
                                .put('/api/v1/tasks')
                                .set('Content-Type', 'application/json')
                                .set('Authorization', token)
                                .query({ id: id })
                                .send(JSON.stringify(taskSample))
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })
                })
        })

        it('Should not update a selected task for current user due to invalid credential', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.docs.length - 1))
                            let taskSample = taskFixtures.create()
                            let existingTaskId = res.body.data.docs[i]._id
                            chai.request(server)
                                .post('/api/v1/auth/login')
                                .set('Content-Type', 'application/json')
                                .send(JSON.stringify(userSample2))
                                .end((err, res) => {
                                    let token2 = res.body.data.token
                                    chai.request(server)
                                        .put(`/api/v1/tasks`)
                                        .set('Content-Type', 'application/json')
                                        .set('Authorization', token2)
                                        .query({ id: existingTaskId })
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
    })

    context('GET /api/v1//tasks/filter/importance/:value/:page', () => {
        it('Should show filtered by importance level tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    let valueParam = ['1', '2', '3']
                    let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                    chai.request(server)
                        .get(`/api/v1/tasks`)
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false, importanceLevel: randomParam })
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/importance`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ value: randomParam, page: page, })
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

        it('Should not show filtered by importance level tasks for current user due to invalid importance level value', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    let valueParam = ['1', '2', '3']
                    let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                    chai.request(server)
                        .get(`/api/v1/tasks`)
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false, importanceLevel: randomParam })
                        .end((err, res) => {
                            randomParam = 'randomParam'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/importance`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ value: randomParam, page: page, })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid importancelevel value parameter!')
                                });
                        })
                })
        })

        it('Should not show filtered by importance level tasks for current user due to invalid page', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    let valueParam = ['1', '2', '3']
                    let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                    chai.request(server)
                        .get(`/api/v1/tasks`)
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false, importanceLevel: randomParam })
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/importance`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ value: randomParam, page: page, })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })
                })
        })
    })

    context('GET /api/v1//tasks/filter/completion', () => {
        it('Should show filtered by completion tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    let valueParam = [true, false]
                    let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                    chai.request(server)
                        .get(`/api/v1/tasks`)
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false, completion: randomParam })
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/completion`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ value: randomParam, page: page, })
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

        it('Should not show filtered by completion tasks for current user due to invalid completion value', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    let valueParam = [true, false]
                    let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                    chai.request(server)
                        .get(`/api/v1/tasks`)
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false, completion: randomParam })
                        .end((err, res) => {
                            randomParam = 'randomParam'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/completion`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ value: randomParam, page: page, })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid completion value parameter!')
                                });
                        })
                })
        })

        it('Should not show filtered by completion tasks for current user due to invalid page', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    let valueParam = [true, false]
                    let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                    chai.request(server)
                        .get(`/api/v1/tasks`)
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false, completion: randomParam })
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/completion`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ value: randomParam, page: page, })
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
        it('Should not delete a task due to invalid task id', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let id = 'randomId'
                            chai.request(server)
                                .delete('/api/v1/tasks')
                                .set('Authorization', 'Bearer ' + token)
                                .query({ id: id })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error.message).to.eq('Cast to ObjectId failed for value "randomId" at path "_id" for model "Task"');
                                });
                        })
                })
        })

        it('Should not delete a selected task for current user due to invalid credential', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.docs.length - 1))
                            let taskSample = taskFixtures.create()
                            let existingTaskId = res.body.data.docs[i]._id
                            chai.request(server)
                                .post('/api/v1/auth/login')
                                .set('Content-Type', 'application/json')
                                .send(JSON.stringify(userSample2))
                                .end((err, res) => {
                                    let token2 = res.body.data.token
                                    chai.request(server)
                                        .delete(`/api/v1/tasks`)
                                        .set('Content-Type', 'application/json')
                                        .set('Authorization', 'Bearer ' + token2)
                                        .query({ id: existingTaskId })
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

        it('Should delete a task for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks')
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.docs.length - 1))
                            let id = res.body.data.docs[i]._id
                            chai.request(server)
                                .delete(`/api/v1/tasks`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ id: id })
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