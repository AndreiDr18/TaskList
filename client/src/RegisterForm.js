import React, { Component } from 'react';
import './micromodal.css';
import { instanceOf } from 'prop-types';
import { Cookies, withCookies } from 'react-cookie';
let JWT = require('jose');

class RegisterForm extends Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props){
        super(props);

        this.state = {
            username:'',
            password:''
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    async signPayload(payload){
        let {publicKey, privateKey} = await JWT.generateKeyPair("ES512");
        let content = await new JWT.SignJWT(payload)
        .setProtectedHeader({ alg: 'ES512' })
        .sign(privateKey);

        let key = await JWT.exportJWK(publicKey);
        return {key, content};
     
    }

    handleChange(event){
        
        this.setState({
            [event.target.id]:event.target.value
        });

    }

    handleSubmit(event){
        event.preventDefault();
        
        const {cookies} = this.props;

        this.signPayload(this.state)
        .then((data)=>{

            fetch('http://www.localhost:8080/api/register', {
                headers: {
                    "Content-type": "application/json"
                },
                method:'post',
                mode:'cors',
                body:JSON.stringify(data)
            }).then(result =>{

                result.json()
                .then((result)=>{

                    JWT.importJWK(result.key, 'ES512')
                    .then(key=>{

                        JWT.jwtVerify(result.content, key)
                        .then(userData =>{

                            if(userData.payload.success)
                                cookies.set('UUID', userData.payload.UUID, {path: '/'});
                                window.location.reload(false);
                        });
                    });
                });
                
            });
        });
    }

    render() {
        return (
            <div>
                <form action="localhost:8080/register" method="post">
                    <label htmlFor="username">Username: </label>
                    <input type="text" value={this.state.username} onChange={this.handleChange} placeholder="Anthony432" id="username" /><br/>
                    <label htmlFor="password">Password: </label>
                    <input type="password" value={this.state.password} onChange={this.handleChange} placeholder="..." id="password" /><br/>
                    <input className="modal__btn" type="submit" onClick={this.handleSubmit}/>
                </form>
            </div>
        )
    }
}

export default withCookies(RegisterForm);