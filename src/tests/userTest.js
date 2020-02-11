const chai = require('chai')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const expect = chai

chai.use(require("chai-http"));

const app = require("../index");

