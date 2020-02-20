const chai = require('chai');
const chaiHttp = require('chai-http');
const {
    expect
} = chai;
chai.use(chaiHttp);
const server = require('../index');

describe('ROOT END POINT TESTING', () => {
    context('GET /api/v1/', () => {
        it('Should find root end point', () => {
            chai.request(server)
                .get('/')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    let { success, data } = res.body;
                    expect(success).to.eq(true);
                })
        })

        it('Should show end point is not found', () => {
            chai.request(server)
                .get('/api/v1/wrongEndPoint')
                .end((err, res) => {
                    expect(res.status).to.equal(404);
                    let { status, data } = res.body;
                    expect(status).to.eq(false);
                })
        })
    })
})