import React, { Component } from 'react'
import './taskElement.scss';
import AddTaskForm from './AddTaskForm';
import micromodal from 'micromodal';
import './micromodal.css';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import Cookies from 'universal-cookie';
let JWT = require('jose');

class TaskList extends Component {
    constructor(props){
        super(props);
        this.state = {
            tasks:{},
            totalTasks:0,
            statusFilter:{
                ToDo:0,
                InProgress:0,
                Done:0,
                Failed:0
            },
            page:0
        };
        this.handlePaginationChange = this.handlePaginationChange.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);
    }
    async signPayload(payload){
        let {publicKey, privateKey} = await JWT.generateKeyPair("ES512");
        let content = await new JWT.SignJWT(payload)
        .setProtectedHeader({ alg: 'ES512' })
        .sign(privateKey);
        let key = await JWT.exportJWK(publicKey);
        return {key, content};
    }
    componentDidMount(){
        let cookies = new Cookies();
        let UUID = cookies.get('UUID');

        this.signPayload({all:true, UUID:UUID})
        .then(body=>{

            fetch(`http://www.localhost:8080/api/tasks?content=${body.content}&crv=${body.key.crv}&kty=${body.key.kty}&x=${body.key.x}&y=${body.key.y}&page=0`, {
                headers:{'Content-Type':'application/json'},
                mode:'cors',
                method:'get'
            })
            .then(response=>{
                response.json()
                .then(response=>{
                    JWT.importJWK(response.key, 'ES512')
                    .then(key=>{
                        JWT.jwtVerify(response.content, key)
                        .then(responseData=>{
                            this.setState({
                                tasks:responseData.payload.tasks,
                                totalTasks:responseData.payload.totalTasks
                            });

                        })
                        .catch(e=>{

                        })
                    })
                })
            })
        })
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        let cookies = new Cookies();
        let UUID = cookies.get('UUID');

        if(prevState.page !== this.state.page || prevState.statusFilter !== this.state.statusFilter){
            let all = true;
            for(const stat of Object.keys(this.state.statusFilter)){
                if(this.state.statusFilter[`${stat}`] === true){
                    all = false;
                    break;
                }
            }
            
            this.signPayload({
                all:all,
                statusFilter:this.state.statusFilter,
                UUID:UUID
            })
            .then(body=>{
                fetch(`http://www.localhost:8080/api/tasks?content=${body.content}&crv=${body.key.crv}&kty=${body.key.kty}&x=${body.key.x}&y=${body.key.y}&page=${this.state.page}`, {
                    mode:'cors',
                    method:'get'
                })
                .then(response=>{
                    response.json()
                    .then(response=>{
                        JWT.importJWK(response.key, 'ES512')
                        .then(key=>{
                            JWT.jwtVerify(response.content, key)
                            .then(responseData=>{
                                this.setState({
                                    tasks:responseData.payload.tasks,
                                    totalTasks:responseData.payload.totalTasks
                                });
                            })
                            .catch(e=>{
                            })
                        })
                    })
                })
            })
        }
        
    }

    tasksArray(){
        let taskList = [];
        let tasks = this.state.tasks;
        for(let index = 1; index <= Object.keys(tasks).length;index++){
            taskList.push(tasks[`${index}`]);
        }
        return taskList;
    }

    handlePaginationChange(e){
        this.setState({
            page:e.target.id
        })
    }

    TaskPagination(){
        let PaginationItems = [];

        for(let index = 0;index < (this.state.totalTasks/4) ; index++)
            PaginationItems.push((
                <Pagination.Item key={index} onClick={this.handlePaginationChange.bind(this)} id={index} name="page">{index}</Pagination.Item>
            ));

        

        return PaginationItems;
    }

    handleFilterChange(e){
        let unchangedFilters = [];

        for(let key of Object.keys(this.state.statusFilter)){
            if(key !== e.target.name){
                unchangedFilters.push(key);
            }
        }
        this.setState({
            statusFilter:{
                [`${e.target.name}`]:!this.state.statusFilter[`${e.target.name}`],
                [`${unchangedFilters[0]}`]:this.state.statusFilter[`${unchangedFilters[0]}`],
                [`${unchangedFilters[1]}`]:this.state.statusFilter[`${unchangedFilters[1]}`],
                [`${unchangedFilters[2]}`]:this.state.statusFilter[`${unchangedFilters[2]}`]
            }
        });
    }

    TaskTemplate(task, i){
        task = task.task;
        return (
            <>
                    <Card style={{ width: '18rem' }} key={i}>
                        <Card.Body>
                            <Card.Title>{task.name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{task.description}</Card.Subtitle>
                            <Card.Subtitle href="#"><small className="text-muted">{task.status}</small></Card.Subtitle>
                            <Card.Footer>
                                <small className="text-muted">{task.dueDate}</small><br/>
                                <small className="text-muted">Tags: {task.tags}</small>
                            </Card.Footer>
                        </Card.Body>
                    </Card>
            </>
        )
    }

    render() {
        return (
            <>
                <Button variant="dark" onClick={()=>{micromodal.show('addTask')}}>Add Task</Button>
                
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Form.Check name="ToDo" type="checkbox" label="ToDo" inline onClick={this.handleFilterChange}/>
                    <Form.Check name="InProgress" type="checkbox" label="In Progress" inline onClick={this.handleFilterChange}/>
                    <Form.Check name="Done" type="checkbox" label="Done" inline onClick={this.handleFilterChange}/>
                    <Form.Check name="Failed" type="checkbox" label="Failed" inline onClick={this.handleFilterChange}/>
                </Form.Group>
                
                <Row className="mt-2">
                    {this.tasksArray().map((task, i)=> <this.TaskTemplate task={task} i={i}/>)}
                </Row>

                <Pagination>{this.TaskPagination()}</Pagination>

                <div className="modal micromodal-slide" id="addTask" aria-hidden="true">
                <div className="modal__overlay" tabIndex="-1">
                  <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title" data-micromodal-close>
                    <header className="modal__header">
                    <h2 className="modal__title" id="addTask_title">
                        Add Task
                    </h2>
                    <button className="modal__close" aria-label="Close modal" data-micromodal-close></button>
                    </header>
                    <main className="modal__content" id="addTask_content">
                    <AddTaskForm/>
                    </main>
                </div>
                </div>
                </div>
            </>
        )
    }
}

export default TaskList;