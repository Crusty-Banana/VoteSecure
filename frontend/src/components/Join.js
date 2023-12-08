import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom"
import { Form, Button, Container, Row, Col, Dropdown } from 'react-bootstrap'
import Axios from 'axios'
import { useLocation } from 'react-router-dom';

export default function Join() {

  const location = useLocation();
  const params = useParams();
  const [onGoing, setOngoing] = useState(true)
  const candidates = location.state?.candidates

  useEffect(() => {
    Axios.get(`http://localhost:3000/isSessionOngoing/${params.sessionId}`, {
    }).then((response) => {
      setOngoing(response.data)
    }).catch(err => console.log(err));
  }, [])

  const [voterId, setVoter] = useState('');
  const [selectedName, setSelectedName] = useState('')

  const handleVote = (event) => {
    event.preventDefault()
    if (selectedName && voterId) {
      Axios.post("http://localhost:3000/vote", {
        voterId: voterId,
        sessionId: params.sessionId,
        candidateName: selectedName,
      }).then(() => {
        window.alert("Successfully voted")
      }).catch((err) => {
        window.alert("Voting failed. Either voted or voter does not exist!")
      })
    } else {
      window.alert("Missing fields")
    }

  }

  const handleSelect = (value) => {
    setSelectedName(value);
  };

  if (!onGoing) {
    <Container>
      <h1>Vote session not ongoing!</h1>
    </Container>
  }

  return (
    <Container>
        <Row md={1}>
          <Col md={5}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Voter ID</Form.Label>
              <Form.Control type="text" placeholder="Enter Voter ID" onChange={(e) => setVoter(e.target.value)}/>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Select a Candidate</Form.Label>
              <Dropdown onSelect={handleSelect}>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  {selectedName ? selectedName : 'Select a Value'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {candidates.map(candidate=>
                    <Dropdown.Item key={candidate} eventKey={candidate}>{candidate}</Dropdown.Item>
                    )}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <Button className='mt-4' variant="primary" type="submit" onClick={(event) => handleVote(event)}>
              Vote!
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
