import React from 'react';
import { Card, ListGroup, Button } from 'bootstrap-4-react';
import { Link } from 'react-router-dom'

export default function VotingSessionCardVoter(props) {

    const {description, candidates, sessionId} = props

    return (
        <Card>
            <Card.Body>
                <Card.Title>{description}</Card.Title>
                <ListGroup flush>
                    {candidates.map((candidate) => <ListGroup.Item>{candidate}</ListGroup.Item>)}
                </ListGroup>
            </Card.Body>
            <Card.Footer>
                <Link to ={`/Join/${sessionId}`} state={{ candidates: candidates }}>
                    <Button variant="outline-primary">Vote</Button>
                </Link>
                <Link to ={`/Status/${sessionId}`}>
                    <Button variant="outline-primary">Status</Button>
                </Link>
            </Card.Footer>
        </Card>
    )
}
