import './App.css';
import './micromodal.css';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import TaskList from './TaskList';
import micromodal from 'micromodal';
import Cookies from 'universal-cookie';

import Button from 'react-bootstrap/Button';

const cookies = new Cookies();

function App() {

  return (
    
    <>
      <div className="App">
            <IsLoggedInFrontPage/>
            
      </div>
      <IsLoggedInModals/>
    </>
  );
}

function IsLoggedInModals() {
  if(cookies.get('UUID') === undefined || cookies.get('UUID') === null) return (
  
    <>
      <div className="modal micromodal-slide" id="register" aria-hidden="true">
        <div className="modal__overlay" tabIndex="-1">
          <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title" data-micromodal-close>
            <header className="modal__header">
              <h2 className="modal__title" id="register_title">
                Register
              </h2>
              <button className="modal__close" aria-label="Close modal" data-micromodal-close></button>
            </header>
            <main className="modal__content" id="register_content">
              <RegisterForm/>
            </main>
          </div>
        </div>
      </div>

      <div className="modal micromodal-slide" id="login" aria-hidden="true">
        <div className="modal__overlay" tabIndex="-1">
          <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title" data-micromodal-close>
            <header className="modal__header">
              <h2 className="modal__title" id="login_title">
                Login
              </h2>
              <button className="modal__close" aria-label="Close modal" data-micromodal-close></button>
            </header>
            <main className="modal__content" id="login_content">
              <LoginForm/>
            </main>
          </div>
        </div>
      </div>
    </>
  )
  else return null;
}

function IsLoggedInFrontPage() {
  if(cookies.get('UUID') === undefined || cookies.get('UUID') === null)
  
    return (
    
      <>
        <Button variant="success" onClick={()=>{micromodal.show('register')}}>Register</Button>
        <Button variant="primary" onClick={()=>{micromodal.show('login')}}>Log In</Button>
        
      </>
    )
  
  else
    return ( 
      <>
        <Button variant="danger" onClick={()=>{cookies.remove('UUID');window.location.reload(false);}}>Log Out</Button>

        <TaskList/>
      </>
      
    )
  
}




export default App;
