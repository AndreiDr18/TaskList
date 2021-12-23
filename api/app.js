require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const jose = require('jose');
const crypto = require('crypto-js');
const {v4:UUID} = require('uuid');

const db = mysql.createPool({
    host     : 'remotemysql.com',
    user     : `${process.env.DB_USERNAME}`,
    password : `${process.env.DB_PASSWORD}`,
    database : '2fIDqKRC00',
    connectionLimit:20
});


app.use(cors());

app.listen(8080, ()=>{
    console.log('Listening to port 8080');
});

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post('/api/register',(req, res)=>{
    let existing = false;
    jose.importJWK(req.body.key, 'ES512')
    .then(result=>{
        jose.jwtVerify(req.body.content,result)
        .then(userData=>{
            let hashedPass = crypto.SHA512(userData.payload.password).toString();
            let privateUUID = UUID();
            db.getConnection((err, connection)=>{
                if(err) return res.send(400);
                if(userData.payload.password === undefined || userData.payload.password === ''){
                    console.log('Password undefined');
                    res.sendStatus(400);
                }
                else if(userData.payload.username === undefined || userData.payload.username === ''){
                    console.log('Username undefined');
                    res.sendStatus(400);
                }
                else{

                    db.query(`SELECT * FROM users WHERE username = '${userData.payload.username}'`, (error, result, fields)=>{
                        if(error) throw error;
                        if(result.length == 0){
                            db.query(`INSERT INTO users(UUID, username, password) VALUES ('${privateUUID}','${userData.payload.username}', '${hashedPass}')`, (error, result, fields)=>{
                                if(error) throw error;
                                let response = {success:true, UUID:privateUUID};
                                signPayload(response)
                                .then(response=>{
                                    res.json(response);
                                });
                                connection.release();
                            });
                        }
                        else{
                            let response = {existing:true};
                            signPayload(response)
                            .then(response=>{
                                res.json(response);
                            });
                            connection.release();
                        }
                        
                    });
                }
            });
                
        })
        .catch(e=>{
            console.error(e);
            return res.send(400);
        })
        
    })
});

app.post('/api/login', (req, res)=>{
    jose.importJWK(req.body.key, 'ES512')
    .then(result=>{

        jose.jwtVerify(req.body.content,result)
        .then(userData=>{

            let hashedPass = crypto.SHA512(userData.payload.password).toString();
            db.getConnection((err, connection)=>{
                if(err) return res.send(400);

                db.query(`SELECT * FROM users WHERE username = '${userData.payload.username}' AND password = '${hashedPass}'`, (error, result, fields)=>{
                    if(error) throw error;

                    if(result.length === 0){
                        let response = {success:false}
                        signPayload(response)
                        .then(response=>{
                            res.json(response);
                        });
                    }else{
                        let response = {success:true, UUID:result[0].UUID};
                        signPayload(response)
                        .then(response=>{
                            res.json(response);
                        });
                        
                    }
                    connection.release();
                });
            });   
        })
        .catch(e=>{
            console.error(e);
        });
        
    });
    
});

app.get('/api/tasks',userValidation, (req, res)=>{
    let rebuiltQueryKey = {
        crv:req.query.crv,
        kty:req.query.kty,
        x:req.query.x,
        y:req.query.y
    }
    jose.importJWK(rebuiltQueryKey, 'ES512')
    .then(key=>{
        jose.jwtVerify(req.query.content, key)
        .then(requestData=>{
            if(requestData.payload.all){
                db.getConnection((err, connection)=>{
                    if(err){
                        connection.release();
                        return res.sendStatus(400);
                    } 
                    else{
                        db.query('SELECT * FROM tasks', (err, tasks, fields)=>{
                            let tasksObject = {};

                            for(let index = (req.query.page*4);(index<=(req.query.page*4)+3) && (index<=(tasks.length-1));index++){
                                tasksObject[`${index - (req.query.page*4-1)}`] = tasks[index];
                            }

                            signPayload({tasks:tasksObject, totalTasks:tasks.length})
                            .then(response=>{
                                res.json(response);
                                connection.release();
                            })
                        })
                    }
                });
            }
            else{
                let query = 'SELECT * FROM tasks WHERE';
                let orBool = false;
                for(let stat of Object.keys(requestData.payload.statusFilter)){
                    if(requestData.payload.statusFilter[`${stat}`] == true){
                        query += orBool ? ' OR ' : '';
                        query += ` status='${stat}'`;
                        orBool = true;
                    }
                }
                db.getConnection((err, connection)=>{
                    if(err){
                        console.log('line 164');
                        connection.release();
                        return res.sendStatus(500);
                    } 
                    else{
                        db.query(query, (err, tasks, fields)=>{
                            let tasksObject = {};

                            if(tasks != undefined){
                                for(let index = (req.query.page*4);(index<=(req.query.page*4)+3 && (index<=(tasks.length-1)));index++){
                                    tasksObject[`${index - (req.query.page*4-1)}`] = tasks[index];
                                }
                                signPayload({tasks:tasksObject, totalTasks:tasks.length})
                                .then(response=>{
                                    res.json(response);
                                    connection.release();
                                })
                            }
                            else{
                                res.sendStatus(500);
                                console.error('Tasks undefined line 172');
                            }
                        })
                    }
                })

            }
        })
        .catch(e=>{
            console.log('line 190');
            console.error(e);
            res.sendStatus(400);
        })
    })
});

app.post('/api/tasks',userValidation, (req, res)=>{

    jose.importJWK(req.body.key, 'ES512')
    .then((key)=>{
        jose.jwtVerify(req.body.content, key)
        .then(reqBody=>{
            reqBody = reqBody.payload;
            let reqDate = new Date(reqBody.dueDate);

            if((reqDate.getTime() - Date.now()) > 0){
                db.getConnection((err, connection)=>{
                    if(err){
                        console.error(e);
                        res.sendStatus(500);
                        connection.release();
                    }else{
                        let query = mysql.format(`INSERT INTO tasks(name, description, dueDate, tags) VALUES (?,?,?,?)`, [`${reqBody.name}`,`${reqBody.description}`,`${reqBody.dueDate}`,`${reqBody.tags}`]);
                        db.query(query, (err, result, fields)=>{
                            if(err){
                                console.error(err);
                                res.sendStatus(500);
                                connection.release();
                            }
                            else{
                                signPayload({success:true, task:result})
                                .then(response=>{
                                    res.json(response);
                                    connection.release();
                                })
                                .catch(e=>{
                                    console.error(e);
                                    res.sendStatus(500);
                                    connection.release();
                                })
                            }
                        })
                    }
                })
            }
            else{
                res.sendStatus(400);
            }
        })
        .catch(e=>{
            console.error(e);
            res.sendStatus(400);
        })
    })
    .catch(e=>{
        console.error(e);
        res.sendStatus(400);
    })
})
async function signPayload(payload){
    let {publicKey, privateKey} = await jose.generateKeyPair("ES512");
    let content = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'ES512' })
    .sign(privateKey);

    let key = await jose.exportJWK(publicKey);
    return {key, content};
 
}

function userValidation(req, res, next){
    let key;
    let content;
    if(req.method == 'POST'){
        key = req.body.key;
        content = req.body.content;
        console.log('POST');
    } 
    else if(req.method == 'GET'){
        key = {
            crv:req.query.crv,
            kty:req.query.kty,
            x:req.query.x,
            y:req.query.y
        }
        content = req.query.content;
        
    }
    else{
        console.error('279 Bad Req Method');
        return res.sendStatus(400);
    }

    jose.importJWK(key, 'ES512')
    .then(result=>{
        
        jose.jwtVerify(content, result)
        .then(reqBody=>{
            
            db.getConnection((err, connection)=>{
                if(err) res.sendStatus(500);
                else{
                    db.query(`SELECT * FROM users WHERE UUID='${reqBody.payload.UUID}'`, (err, results, fields)=>{
                        if(err){
                            res.sendStatus(500);
                            connection.release();
                        } 
                        else if(results.length == 1){
                            connection.release();
                            next();
                        }
                        else{
                            res.sendStatus(400);
                            connection.release();
                        }
                    })
                }
            })
        })
        .catch(e=>{
        console.error(e);
        res.sendStatus(400);
        })
    })
    .catch(e=>{
        console.error(e);
        res.sendStatus(400);
    })

    
}

