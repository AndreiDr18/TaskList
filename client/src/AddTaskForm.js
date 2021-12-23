import React, { Component } from 'react';
import './micromodal.css';
import Cookies from 'universal-cookie';
let JWT = require('jose');

class LoginForm extends Component {

    constructor(props){
        super(props);

        this.state = {
            name:'',
            description:'',
            dueDate:Date(),
            status:''
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
        console.log(this.state);
        console.log(event.target.id);
    }

    handleSubmit(event){
        event.preventDefault();
        let cookies = new Cookies();
        let UUID = cookies.get('UUID');
        this.signPayload({
            name:this.state.name,
            description:this.state.description,
            dueDate:this.state.dueDate,
            tags:this.state.tags,
            UUID:UUID

        })
        .then((data)=>{
            fetch('http://www.localhost:8080/api/tasks', {
                headers: {
                    "Content-type": "application/json"
                },
                method:'post',
                mode:'cors',
                body:JSON.stringify(data)
            }).then(result =>{
                console.log(result);
                result.json()
                .then((result)=>{
                    console.log(result);
                    JWT.importJWK(result.key, 'ES512')
                    .then(key=>{
                        console.log(key);
                        JWT.jwtVerify(result.content, key)
                        .then(response =>{
                            console.log(response, '\n ----');
                            if(response.payload.success)
                                console.log(response);
                                window.location.reload(false);
                        });
                    });
                })
                
            });
        });
    }

    render() {
        return (
            <div>
                <form method="post">
                    <label htmlFor="name">Name: </label>
                    <input type="text" value={this.state.name} onChange={this.handleChange} placeholder="Project Planning" id="name" required/><br/>
                    <label htmlFor="description">Description: </label>
                    <input type="text" value={this.state.description} onChange={this.handleChange} placeholder="Meeting with the team" id="description" required/><br/>
                    <label htmlFor="dueDate">Due Date: </label>
                    <input type="Date" value={this.state.dueDate} onChange={this.handleChange} id="dueDate" required/><br/>
                    <label htmlFor="tags">Tags: </label>
                    <input type="text" value={this.state.tags} placeholder='Work TeamBuilding Home' onChange={this.handleChange} id="tags" required/><br/>
                    <input className="modal__btn" type="submit" onClick={this.handleSubmit}/>
                </form>
            </div>
        )
    }
}

export default LoginForm;
