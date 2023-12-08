import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom"
import { Table } from 'react-bootstrap';
import VoteData from './voteData';
import Axios from 'axios'

export default function Results() {
    const [data, setData] = useState();

    let params = useParams();

    useEffect(() => {
        Axios.get(`http://localhost:3000/getResult/${params.sessionId}`, {
        }).then((response) => {
          setData(response.data)
        }).catch(err => console.log(err));
    }, [])

    return (
        <Table striped bordered hover>
        <thead>
            <tr>
            <th>Candidate</th>
            <th>Votes</th>
            </tr>
        </thead>
        <tbody>
            {data && <VoteData users={data}/>}
        </tbody>
        </Table>
    )
}