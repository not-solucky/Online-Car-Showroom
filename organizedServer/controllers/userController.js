// const models = require('../models');
// const bcryptjs = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const Validator = require('fastest-validator')

// function signUp(req, res) {
//     const credentials = {
//         name    : req.body.name,
//         email   : req.body.email,
//         password: req.body.password,
//         phone   : req.body.phone,
//         role    : 'user'
//     };
//     const schema = {
//         // name    : {type: 'string', optional: false, max: "100", min: "1"},
//         email   : {type: 'string', optional: false, max: "100", min: "6"},
//         password: {type: 'string', optional: false, min: "6"},
//         // phone   : {type: 'string', optional: false}
//     };
//     const v = new Validator();
//     const validationResponse = v.validate(credentials, schema);

//     if(validationResponse != true) {
//         return res.status(400).json({
//             message: 'Validation failed',
//             error: validationResponse
//         });
//     };

//     models.users.findOne({where: {email: req.body.email}, attributes: ['email']}).then(result =>{
//         console.log(result)
//         if(result){
//             res.status(409).json({
//                 message: 'This email already exists',
//                 result: result
//             })
//         }else {
//             bcryptjs.genSalt(10, function(err, salt) {
//                 bcryptjs.hash(req.body.password, salt, function(err, hash) {
//                     const users = {
//                         name: req.body.name,
//                         email: req.body.email,
//                         password: hash,
//                         phone: req.body.phone,
//                         role: 'user'
//                     };
//                     models.users.create(users).then(result => {
//                         res.status(200).json({
//                             message: "User created successfully",
//                         });
//                     }).catch(error => {
//                         res.status(500).json({
//                             message: "Something went wrong",
//                             error: error
//                         });
//                     });
//                 });
//             }); 
//         };
//     }).catch(error => {
//         res.status(500).json({
//             message: "Something went wrong",
//             error: error
//         });
//     });
// };

// function login(req, res){
//     const credentials = {
//         email: req.body.email,
//         password: req.body.password,
//     };

//     const schema = {
//         email: {type: 'string', optional: false, max: "100", min: "10"},
//         password: {type: 'string', optional: false, min: "6"}
//     };

//     const v = new Validator();
//     const validationResponse = v.validate(credentials, schema);

//     if(validationResponse != true) {
//         return res.status(400).json({
//             message: 'Validation failed',
//             error: validationResponse
//         });
//     };
//     models.users.findOne({where: {email: req.body.email}}).then(user => {
//         if(user == null) {
//             res.status(401).json({
//                 message: 'Invalid credentials'
//             })
//         }else {
//             bcryptjs.compare(req.body.password, user.password, function(err, result){
//                 if(result){
//                     const token = jwt.sign({
//                         email: user.email,
//                         name: user.name,
//                         role: user.role
//                     }, process.env.JWT_KEY, function(err, token) {
//                         res.status(200).json({
//                             message: 'Authentication successful',
//                             token: token
//                         })
//                     });
//                 }else {
//                     res.status(401).json({
//                         message: 'Invalid credentials'
//                     })
//                 }
//             })
//         }
//     }).catch(error => {
//         res.status(500).json({
//             message: "Something went wrong",
//             error: error
//         });
//     });
// }

// module.exports = {
//     signUp: signUp,
//     login: login
// }



const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Validator = require('fastest-validator')
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'online_car_showroom',
  });

function signUp(req, res) {
    const credentials = {
        name    : req.body.name,
        email   : req.body.email,
        password: req.body.password,
        phone   : req.body.phone,
        role    : 'user'
    };
    const schema = {
        name    : {type: 'string', optional: false, max: "100", min: "1"},
        email   : {type: 'string', optional: false, max: "100", min: "6"},
        password: {type: 'string', optional: false, min: "6"},
        phone   : {type: 'string', optional: false}
    };
    const v = new Validator();
    const validationResponse = v.validate(credentials, schema);

    if(validationResponse != true) {
        return res.status(400).json({
            message: 'Validation failed',
            error: validationResponse
        });
    };

    pool.getConnection((err, connection) => {
        if(err) {
            res.status(500).json({
                message: "Error getting database connection",
                error: err
            });
        }

        const sqlQuery = 'SELECT * FROM users WHERE email = ?';
        connection.query(sqlQuery, credentials.email, (queryErr, results) => {
            if(queryErr) {
                res.status(400).json({
                    message: "Something went wrong",
                    error: queryErr
                });
            };
            console.log(results)
            if(results.length != 0){
                res.status(409).json({
                    message: 'This email already exists',
                    results: results
                })
            }else {
                bcryptjs.genSalt(10, function(err, salt) {
                    bcryptjs.hash(req.body.password, salt, function(err, hash) {
                        const users = [
                            req.body.name,
                            req.body.email,
                            hash,
                            req.body.phone,
                            'user'
                        ];
                        const sqlQuery = 'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)';
                        connection.query(sqlQuery, users, (queryErr, results) => {
                            connection.release();
                            if(queryErr) {
                                res.status(400).json({
                                    message: "Something went wrong",
                                    error: queryErr
                                });
                            };

                            if(results) {
                                res.status(200).json({
                                    message: "User created successfully",
                                    results: results
                                });
                            };
                        });
                    });
                }); 
            };
        });
    });
};

function login(req, res){
    const credentials = {
        email: req.body.email,
        password: req.body.password,
    };

    const schema = {
        email: {type: 'string', optional: false, max: "100", min: "10"},
        password: {type: 'string', optional: false, min: "6"}
    };

    const v = new Validator();
    const validationResponse = v.validate(credentials, schema);

    if(validationResponse != true) {
        return res.status(400).json({
            message: 'Validation failed',
            error: validationResponse
        });
    };
    pool.getConnection((err, connection) => {
        if(err) {
            res.status(500).json({
                message: "Error getting database connection",
                error: err
            });
        }

        const sqlQuery = 'SELECT * FROM users WHERE email = ?';
        connection.query(sqlQuery, req.body.email, (queryErr, results) => {
            connection.release();
            if(queryErr) {
                res.status(400).json({
                    message: "Something went wrong",
                    error: queryErr
                });
            };
            if(results.length == 0){
                res.status(409).json({
                    message: 'Invalid credentials',
                    results: results
                })
            }else {
                const user = results[0];
                const email = user.email;
                const name = user.name;
                const role = user.role;
                const passwordHash = user.password;
                bcryptjs.compare(req.body.password, passwordHash, function(err, result){
                    if(result){
                        const token = jwt.sign({
                            email: email,
                            name: name,
                            role: role
                        }, process.env.JWT_KEY, function(err, token) {
                            res.status(200).json({
                                message: 'Authentication successful',
                                token: token
                            })
                        });
                    }else {
                        res.status(401).json({
                            message: 'Invalid credentials'
                        })
                    }
                })
            };
        });
    });
}

module.exports = {
    signUp: signUp,
    login: login
}