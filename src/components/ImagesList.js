import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, CardImg } from 'reactstrap';

class ImagesList extends React.Component {

  render() {
    return (
      <Container fluid={true}>
        <Row>
          {(this.props.images).map((object, index) => {
            return (
              <Col xs="3">
              <Card>
                <CardImg top width="100%" src="" alt="Image" />
                <CardBody>
                  <CardTitle>{object.name}</CardTitle>
                  <CardText>{object.description}</CardText>
                  <CardText>
                    <small className="text-muted">{object["date-added"]}</small>
                  </CardText>
                </CardBody>
              </Card>
            </Col>
            )
          })}
        </Row>
      </Container>
    )
  }
}

export default ImagesList;
