import React, {useState, useEffect} from 'react';
import store  from 'storejs';
import Dashboard from './Dashboard';
import LoginPage from './LoginPage';

function Home() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const authenticated = store.get('isAuthenticated');
      if(authenticated) {
        setIsAuthenticated(authenticated);
      }
    }, [isAuthenticated])
    

  return (
    <>
    {!isAuthenticated ? (
        <LoginPage setIsAuthenticated={setIsAuthenticated}></LoginPage>
    ): (<Dashboard setIsAuthenticated={setIsAuthenticated}></Dashboard>)}
    </>
  );
}


export default Home
