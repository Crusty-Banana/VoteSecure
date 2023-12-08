import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Button } from 'bootstrap-4-react';
import Axios from 'axios'

export default function App(props) {

    const [onGoing, setOngoing] = useState();
    const { description, sessionId, candidates } = props

    const checkIsOngoing = () => {
        Axios.get(`http://localhost:3000/isSessionOngoing/${sessionId}`, {
            }).then((response) => {
            console.log(response.data)
            setOngoing(response.data)
        }).catch(err => console.log(err));
    }

    useEffect(() => {
        checkIsOngoing()
    }, [])
    
    const handleStart = (event) => {
        event.preventDefault()
        Axios.post(`http://localhost:3000/startSession/${sessionId}`, {
            token: localStorage.getItem('token'),
            }).then(() => {
                window.alert("Started successfully!")
                checkIsOngoing()
            }).catch((err) => {
                console.log(err)
                window.alert("Failed to start")
            });

    }

    const handleEnd = (event) => {
        event.preventDefault()
        Axios.post(`http://localhost:3000/endSession/${sessionId}`, {
            token: localStorage.getItem('token'),
            }).then(() => {
                window.alert("Ended successfully!")
                checkIsOngoing()
            }).catch((err) => window.alert("Failed to end"));
    }

    if (onGoing === "") {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>{description}</Card.Title>
                    <ListGroup flush>
                        {candidates.map((candidate) => <ListGroup.Item>{candidate}</ListGroup.Item>)}
                    </ListGroup>
                </Card.Body>
                <Card.Footer>
                    <h5>Loading</h5>
                </Card.Footer>
            </Card>
        )
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title>{description}</Card.Title>
                <ListGroup flush>
                    {candidates.map((candidate) => <ListGroup.Item>{candidate}</ListGroup.Item>)}
                </ListGroup>
            </Card.Body>
            <Card.Footer>
                {onGoing ? <Button primary onClick={(event) => handleEnd(event)}>End Session</Button> : <Button primary onClick={event => handleStart(event)}> Start Session</Button>}
            </Card.Footer>
        </Card>
    )
}
