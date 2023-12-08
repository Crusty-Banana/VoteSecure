const VoteData = ({users}) => {
    const candidates = users[0]
    const values = users[1]

    return (
        <>
        {
            candidates.map((candidate, index) => (
                <tr key={index}>
                  <td>{candidate}</td>
                  <td>{values[index]}</td>
                </tr>
              ))
        }
        </>
    )
}

export default VoteData