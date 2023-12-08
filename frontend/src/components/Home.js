import React, { Component } from 'react';
import { Button, Card, Row, Col, Container, Image,  } from "react-bootstrap";
import { Link } from 'react-router-dom'
import './home.css'

export default class Home extends Component {

    
    render(){
        return (
            <div className="Home">
                <main>
                    <Container>
                    <Row className="px-4 my-5">
                        <Col sm={12}>
                        <Image
                        src = "/votesecure.png"
                        fluid
                        rounded
                        />
                        </Col>
                    </Row>
                    <Row className="my-5">
                        <Col>
                        <Card style={{ width: '35rem', height: '10rem' }}>
                            <Card.Body>
                            <Card.Title>For Admin</Card.Title>
                            <Card.Text>
                                If you are an admin and wish to create a new voting session, click the button below
                            </Card.Text>
                            <Link to ={"/Admin"}>
                            <Button variant="outline-primary">Admin</Button>
                            </Link>
                            </Card.Body>
                        </Card>
                        </Col>
                        <Col>
                        <Card style={{ width: '35rem', height: '10rem' }}>
                            <Card.Body>
                            <Card.Title>For Voters</Card.Title>
                            <Card.Text>
                                If you are a voter and wish to join in an active session or view results, click the button below
                            </Card.Text>
                            <Link to ={"/Voter"}>
                            <Button variant="outline-primary">Voters</Button>
                            </Link>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                    </Container>
                </main>
            </div>
        );
    }
}