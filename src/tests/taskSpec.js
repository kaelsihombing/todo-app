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

taskSample1 = taskFixtures.create();
taskSample2 = taskFixtures.create();
taskSample3 = taskFixtures.create();
taskSample1.importanceLevel = 1
taskSample2.importanceLevel = 2
taskSample3.importanceLevel = 3


describe('TASK API UNIT TESTING', () => {
    before(() => {
        // User.deleteMany({}, () => { })
        // Task.deleteMany({}, () => { })
        userSample.password_confirmation = userSample.password
        User.register(userSample)
        userSample2.password_confirmation = userSample2.password
        User.register(userSample2)

        Task.newTask(taskSample1, userSample._id)
        Task.newTask(taskSample2, userSample._id)
        Task.newTask(taskSample3, userSample._id)

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

    context('GET /api/v1/tasks/:page/:pagination', () => {
        it('Should show tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/${page}`)
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

        it('Should not show tasks for current user due to invalid page', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            chai.request(server)
                                .get(`/api/v1/tasks/${page}`)
                                .set('Authorization', token)
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, data } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })

                })
        })
    })

    context('GET /api/v1//tasks/sort/asc/:sort/:page', () => {
        it('Should show ascending sorted tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let sortParam = ['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion']
                            let randomParam = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/asc/${randomParam}/${page}`)
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

        it('Should not show ascending sorted tasks for current user due to invalid sorting parameter', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let randomParam = 'randomParam'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/asc/${randomParam}/${page}`)
                                .set('Authorization', token)
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
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let sortParam = ['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion']
                            let randomParam = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            page = page.toString()
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/asc/${randomParam}/${page}`)
                                .set('Authorization', token)
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })
                })
        })
    })

    context('GET /api/v1//tasks/sort/desc/:sort/:page', () => {
        it('Should show descending sorted tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let sortParam = ['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion']
                            let randomParam = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/desc/${randomParam}/${page}`)
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

        it('Should not show descending sorted tasks for current user due to invalid sorting parameter', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let randomParam = 'randomParam'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/desc/${randomParam}/${page}`)
                                .set('Authorization', token)
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
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let sortParam = ['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion']
                            let randomParam = sortParam[Math.floor(Math.random() * sortParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            page = page.toString()
                            chai.request(server)
                                .get(`/api/v1/tasks/sort/desc/${randomParam}/${page}`)
                                .set('Authorization', token)
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
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
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let valueParam = ['1', '2', '3']
                            let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/importance/${randomParam}/${page}`)
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

        it('Should not show filtered by importance level tasks for current user due to invalid importance level value', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let randomParam = 'randomParam'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/importance/${randomParam}/${page}`)
                                .set('Authorization', token)
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
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            console.log(res.body);

                            let valueParam = ['1', '2', '3']
                            let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/importance/${randomParam}/${page}`)
                                .set('Authorization', token)
                                .end((err, res) => {
                                    console.log(res.body);

                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })
                })
        })
    })

    context('GET /api/v1//tasks/filter/completion/:value/:page', () => {
        it('Should show filtered by completion tasks for current user', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let valueParam = [true, false]
                            let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/completion/${randomParam}/${page}`)
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

        it('Should not show filtered by completion tasks for current user due to invalid completion value', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let randomParam = 'randomParam'
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = Math.ceil(Math.random() * (lastPage))
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/completion/${randomParam}/${page}`)
                                .set('Authorization', token)
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
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let valueParam = [true, false]
                            let randomParam = valueParam[Math.floor(Math.random() * valueParam.length)]
                            let lastPage = Math.ceil(res.body.data.totalDocs / 10)
                            let page = lastPage + 1
                            chai.request(server)
                                .get(`/api/v1/tasks/filter/completion/${randomParam}/${page}`)
                                .set('Authorization', token)
                                .end((err, res) => {
                                    expect(res.status).to.equal(422);
                                    let { success, error } = res.body;
                                    expect(success).to.eq(false);
                                });
                        })
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
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.docs.length - 1))
                            let taskSample = taskFixtures.create()
                            chai.request(server)
                                .put(`/api/v1/tasks/${res.body.data.docs[i]._id}`)
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

        it('Should not update a selected task for current user due to invalid dueDate', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.docs.length - 1))
                            let taskSample = taskFixtures.create()
                            taskSample.dueDate = faker.date.past()
                            chai.request(server)
                                .put(`/api/v1/tasks/${res.body.data.docs[i]._id}`)
                                .set('Content-Type', 'application/json')
                                .set('Authorization', token)
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
                        .get('/api/v1/tasks/1?pagination=false')
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

        it('Should not update a selected task for current user due to invalid credential', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
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
                                        .put(`/api/v1/tasks/${existingTaskId}`)
                                        .set('Content-Type', 'application/json')
                                        .set('Authorization', token2)
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

    context('DELETE /api/v1/tasks/:id', () => {
        it('Should not delete a task due to invalid task id', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
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

        it('Should not delete a selected task for current user due to invalid credential', () => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(userSample))
                .end((err, res) => {
                    let token = res.body.data.token
                    chai.request(server)
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
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
                                        .delete(`/api/v1/tasks/${existingTaskId}`)
                                        .set('Content-Type', 'application/json')
                                        .set('Authorization', token2)
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
                        .get('/api/v1/tasks/1?pagination=false')
                        .set('Authorization', token)
                        .end((err, res) => {
                            let i = Math.floor(Math.random() * (res.body.data.docs.length - 1));
                            chai.request(server)
                                .delete(`/api/v1/tasks/${res.body.data.docs[i]._id}`)
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