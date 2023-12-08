import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarComp from './components/NavbarComp';
import { AuthProvider } from './components/AuthContext';

function App() {
  return (
    <div className="App">
      <AuthProvider>
      <NavbarComp/>
      </AuthProvider>
    </div>
    );
}

export default App;
