import React, {Fragment, useEffect, useState} from 'react';
import moment from 'moment';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';

import {Container, Row, Col, Image, Card, Button } from 'react-bootstrap';

const App = () => {

  // Setting Application States
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [count, setCount] = useState(0);

  // The Data Fetch Function (API Call).
  const fetchEntries = async (page) => {
  try {
    setLoading(true);

    // Get The Current Parsed Date Of The User (were created in the last 30 days CONSTRAINT).
    const currentDate = moment().subtract(30, "days").format("YYYY-MM-DD");

    // Send The Request. && then Set The States.
    const response = await axios.get(
      `https://api.github.com/search/repositories?q=created:>${currentDate}&sort=stars&order=desc&page=${page}`
    );

    // Entries.
    setEntries((prevState) => [...prevState, ...response.data.items]);

    // Count.
    setCount(response.data.total_count);

    // disable (loader/spinner/ux-event) after fetching data.
    setLoading(false);

    } catch (error) {
      setError(true);
    }
  };

  useEffect(() => {
    fetchEntries(page);
  }, [page]);


  const getDifDays = date => {
    let currentDate = moment(new Date());
    let publishedDate = moment(date);

    let diffDays = currentDate.diff(publishedDate, "days");

    return diffDays;
  }

  return (
    <Fragment>
      <Container fluid className="mt-5">
        <Row>

          <Col xs={12}>
            <InfiniteScroll
              dataLength={count}
              next={() => fetchEntries(page+1)}
              hasMore={!count === 0}
              style={{overflow: "hidden"}}
            >
              {entries.map((entry, index) => (
                <Row key={index} className="mb-3">
                    
                    <Col xs={12} md={4} className="d-flex justify-content-center align-items-center">
                      <Image fluid src={entry.owner.avatar_url} className="border p-1" style={{width: "200px", height: "200px"}} />
                    </Col>

                    <Col xs={12} md={8} className="h-100">
                      <Card>
                        <Card.Header>
                            <Card.Title>{entry.name}</Card.Title>
                        </Card.Header>

                        <Card.Body>
                          {entry.description ? <Card.Text>{entry.description}</Card.Text> : <Card.Text>No Description For This Repo</Card.Text>}
                        </Card.Body>

                        <Card.Footer className="text-muted">

                          <Button disabled size="small" variant="outline-primary" className="me-2">
                            <strong>Stars: {entry.stargazers_count}</strong>
                          </Button>

                          <Button disabled size="small" variant="outline-primary" className="me-2">
                            {entry.open_issues_count ? (
                              <strong>Issues: {entry.open_issues_count} </strong>
                              ) : <strong>No Issues</strong> }
                          </Button>

                          <h6 className="mt-3">
                            Submitted <strong>{getDifDays(entry.created_at)}</strong> Day/s Ago by <strong>{entry.owner.login}</strong>
                          </h6>

                        </Card.Footer>
                      </Card>
                    </Col>

                  </Row>
              ))}
            </InfiniteScroll>
          </Col>

          <Col className="text-center">{loading && <p>Loading ...</p>}</Col>

          <Col className="text-center">{error && <p>{error.message}</p>}</Col>

        </Row>
      </Container>
    </Fragment>
  )
};

export default App;
