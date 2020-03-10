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
                        .set('Authorization', 'Bearer ' + res.body.data.token)
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

        it('Should show page 1 of tasks for current user due to invalid page', () => {
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
                                    expect(res.status).to.equal(200);
                                    let { success, data } = res.body;
                                    expect(success).to.eq(true);
                                });
                        })

                })
        })
    })

    context('GET /api/v1//tasks/sort', () => {
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
                            let randomSort = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomSort, order: 'ascending', page: page })
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
                            let randomSort = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomSort, order: 'descending', page: page })
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
                            let randomSort = 'randomSort'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomSort, order: 'ascending', page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid sorting parameter!')
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
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false })
                        .end((err, res) => {
                            let randomSort = 'randomSort'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomSort, order: 'descending', page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid sorting parameter!')
                                });
                        })
                })
        })

        it('Should not show sorted tasks for current user due to invalid order parameter', () => {
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
                            let randomSort = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            page = page.toString()
                            chai.request(server)
                                .get(`/api/v1/tasks/sort`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomSort, order: 'randomOrder', page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid sorting order')
                                });
                        })
                })
        })

        it('Should show page 1 of ascending sorted tasks for current user due to invalid page', () => {
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
                            let randomSort = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            page = page.toString()
                            chai.request(server)
                                .get(`/api/v1/tasks/sort`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomSort, order: 'ascending', page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(200);
                                    let { success, data } = res.body;
                                    expect(success).to.eq(true);
                                    expect(data.page).to.eq(1);
                                });
                        })
                })
        })

        it('Should show page 1 of descending sorted tasks for current user due to invalid page', () => {
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
                            let randomSort = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            page = page.toString()
                            chai.request(server)
                                .get(`/api/v1/tasks/sort`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ sort: randomSort, order: 'descending', page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(200);
                                    let { success, data } = res.body;
                                    expect(success).to.eq(true);
                                    expect(data.page).to.eq(1);
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

    context('GET /api/v1//tasks/filter', () => {
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
                                .get(`/api/v1/tasks/filter`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ filter: 'importance', importanceLevel: randomParam, page: page })
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

        it('Should show filtered by completion tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    let valueParam = ['true', 'false']
                    let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                    chai.request(server)
                        .get(`/api/v1/tasks`)
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false, completion: randomParam })
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ filter: 'completion', completion: randomParam, page: page })
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
                                .get(`/api/v1/tasks/filter`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ filter: 'importance', importanceLevel: randomParam, page: page, })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid importancelevel value parameter!')
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
                    let valueParam = ['true', 'false']
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
                                .get(`/api/v1/tasks/filter`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ filter: 'completion', completion: randomParam, page: page, })
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                    expect(error).to.eq('Invalid completion value parameter!')
                                });
                        })
                })
        })

        it('Should show page 1 of filtered by importance level tasks for current user due to invalid page', () => {
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
                                .get(`/api/v1/tasks/filter`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ filter: 'importanceLevel', importanceLevel: randomParam, page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(200);
                                    let { success, data } = res.body;
                                    expect(success).to.eq(true);
                                    expect(data.page).to.eq(1);
                                });
                        })
                })
        })

        it('Should show page 1 of filtered by completion tasks for current user due to invalid page', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    let valueParam = ['true', 'false']
                    let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                    chai.request(server)
                        .get(`/api/v1/tasks`)
                        .set('Authorization', 'Bearer ' + token)
                        .query({ page: 1, pagination: false, completion: randomParam })
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            chai.request(server)
                                .get(`/api/v1/tasks/filter`)
                                .set('Authorization', 'Bearer ' + token)
                                .query({ filter: 'completion', completion: randomParam, page: page })
                                .end((err, res) => {
                                    expect(res.status).to.equal(200);
                                    let { success, data } = res.body;
                                    expect(success).to.eq(true);
                                    expect(data.page).to.eq(1);
                                });
                        })
                })
        })
    })


    context('DELETE /api/v1/tasks', () => {
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