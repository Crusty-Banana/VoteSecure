import React, { useState, useEffect } from 'react';
import { Container } from "react-bootstrap";
import Axios from 'axios'
import VotingSessionCardVoter from './VotingSessionCardVoter'

export default function Voter() {

    const [sessions, setSessions] = useState();

    useEffect(() => {
        Axios.get("http://localhost:3000/votingSessions"
        ).then((response) => {
            setSessions(response.data)
        }).catch(err => console.log(err))
    }, [])


    return (
        <Container>
            {sessions && sessions.map((session) => <VotingSessionCardVoter 
            key={session._id} sessionId={session.sessionId} candidates={session.candidates} description={session.description}
            />)}
        </Container>
    )
}