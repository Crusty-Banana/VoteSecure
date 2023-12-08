import React, { useState, useContext, useEffect } from 'react'
import { Form, Button, Container, Row, Col } from 'react-bootstrap'
import Axios from 'axios'
import { AuthContext } from './AuthContext';
import VotingSessionCard from './VotingSessionCard'

export default function Admin(props) {



    const { isLoggedIn } = useContext(AuthContext);
    const [ sessions,  setSessions ] = useState([]);

    const [description, setDescription] = useState('');
    const [candidateinput, setinput] = useState('');
    const [voterinput, setinputvoter] = useState('');

    const handleCreate = (event) => {
        event.preventDefault()
        const candidatelist = candidateinput.split(", ");
        const voterlist = voterinput.split(", ");
        Axios.post("http://localhost:3000/createVotingSession", {
        token: localStorage.getItem('token'),
        description: description,
        candidates: candidatelist,
        voters: voterlist,
        }).then(() => {
            window.alert("Created successfully")
            getAllSessions()
            setDescription("")
            setinput("")
            setinputvoter("")
        }).catch((err) => {
            window.alert("Failed to create")
        });
    }
    const getAllSessions = () => {
        Axios.get("http://localhost:3000/votingSessions"
        ).then((response) => {
            setSessions(response.data)
        }).catch(err => console.log(err));
    }


    useEffect(() => {
        getAllSessions()
    }, []);

      return (
      <div>
        {isLoggedIn? (
            <Container>
                <Row md={1}>
                    <Col md={10}>
                    <Form>
                        <h3>Create a Voting Session</h3>
                        <Form.Group >
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                            className="w-60"
                            as="textarea" rows={3}
                            type="text" placeholder="Enter Description" onChange={(e) => setDescription(e.target.value)}/>
                            </Form.Group>
                            <Form.Group className="mb-3">
                            <Form.Label>Candidates</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter the names of Candidates in the following format: 'Candidate1, Candidate2, etc..'"
                                onChange={(e) => setinput(e.target.value)} />
                            {/* <Button className='mt-2' onClick={addUserName}>Add Candidate</Button> */}
                            </Form.Group>
                            <Form.Group className="mb-3">
                            <Form.Label>Voters</Form.Label>
                            <Form.Control
                                type="text"
                                className="form-control mt-1"
                                placeholder="Enter the names of Voters in the following format: 'Voter1, Voter2, etc..'"
                                onChange={(e) => setinputvoter(e.target.value)} />
                            </Form.Group>
                            <Button className='mt-4' variant="primary" type="submit" onClick={(event) => handleCreate(event)}>
                            Create
                            </Button>
                    </Form>
                    </Col>
                </Row>
                {
                    sessions && sessions.map((session) => {
                    return <VotingSessionCard key={session._id} description={session.description} sessionId={session.sessionId} candidates={session.candidates}/>
                })
                }
            </Container>
        ) : (
            <h2>Please Log in</h2>
        )}
        </div>
      )
}
